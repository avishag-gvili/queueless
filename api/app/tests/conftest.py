"""
Test fixtures.

Tests run against the real PostgreSQL instance (db service in docker-compose).
Tables are created once per session and truncated between tests for isolation.
"""

import asyncio
from collections.abc import AsyncGenerator
from datetime import time

import pytest
import sqlalchemy as sa
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.business import Business
from app.models.service import Service
from app.models.user import User
from app.models.working_hours import WorkingHours

# Use a separate test database to avoid touching dev data
TEST_DATABASE_URL = settings.database_url.rsplit("/", 1)[0] + "/queueless_test"

engine_test = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
async_session_factory = async_sessionmaker(engine_test, expire_on_commit=False)


# ---------------------------------------------------------------------------
# Session-scoped: create the test database schema once
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def event_loop():
    """Provide a single event loop for the whole test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def create_schema():
    """Drop and re-create all tables at the start of the test session."""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine_test.dispose()


# ---------------------------------------------------------------------------
# Function-scoped: isolate each test via truncation
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
async def clean_tables():
    """Truncate all tables after each test to prevent state leakage."""
    yield
    async with engine_test.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(sa.text(f'TRUNCATE TABLE "{table.name}" CASCADE'))


@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session backed by the test database."""
    async with async_session_factory() as session:
        yield session


@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Yield an HTTP test client with the DB dependency overridden."""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Factory fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
async def test_user(db: AsyncSession) -> User:
    user = User(
        email="owner@example.com",
        hashed_password=hash_password("password123"),
        full_name="Test Owner",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_business(db: AsyncSession, test_user: User) -> Business:
    biz = Business(
        owner_id=test_user.id,
        name="Test Salon",
        timezone="Asia/Jerusalem",
    )
    db.add(biz)
    await db.commit()
    await db.refresh(biz)
    return biz


@pytest.fixture
async def test_service(db: AsyncSession, test_business: Business) -> Service:
    svc = Service(
        business_id=test_business.id,
        name="Haircut",
        duration_minutes=30,
    )
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    return svc


@pytest.fixture
async def test_service_open_duration(db: AsyncSession, test_business: Business) -> Service:
    """Service with no fixed duration — uses default_slot_resolution_minutes (60)."""
    svc = Service(
        business_id=test_business.id,
        name="Consultation",
        duration_minutes=None,
    )
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    return svc


@pytest.fixture
async def test_working_hours(db: AsyncSession, test_business: Business) -> WorkingHours:
    """Sunday 09:00–18:00 (day_of_week=0)."""
    wh = WorkingHours(
        business_id=test_business.id,
        day_of_week=0,  # Sunday
        open_time=time(9, 0),
        close_time=time(18, 0),
    )
    db.add(wh)
    await db.commit()
    await db.refresh(wh)
    return wh
