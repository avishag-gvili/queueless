"""
Concurrency test: two simultaneous booking requests for the same slot.
Exactly one must succeed (201) and the other must be rejected (409).

Requires PostgreSQL — the FOR UPDATE lock doesn't work with SQLite.
"""

import asyncio
from datetime import date, datetime, timedelta, UTC

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import get_db
from app.main import app
from app.models.service import Service
from app.models.working_hours import WorkingHours
from app.tests.conftest import async_session_factory


def _next_sunday_9am_utc() -> str:
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_ahead if days_ahead > 0 else 7)
    naive = datetime(next_sunday.year, next_sunday.month, next_sunday.day, 6, 0, 0)
    return naive.replace(tzinfo=UTC).isoformat()


@pytest.mark.asyncio
async def test_concurrent_booking_only_one_succeeds(
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    """Two simultaneous requests for the same slot — exactly one wins."""
    payload = {
        "service_id": str(test_service.id),
        "starts_at": _next_sunday_9am_utc(),
        "customer_name": "Race Condition",
        "customer_email": "race@example.com",
    }

    # Each get_db() call creates a fresh session so concurrent requests don't share state.
    async def fresh_db():  # type: ignore[return]
        async with async_session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = fresh_db

    try:
        async with (
            AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client_a,
            AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client_b,
        ):
            results = await asyncio.gather(
                client_a.post("/api/v1/appointments", json=payload),
                client_b.post("/api/v1/appointments", json=payload),
            )
    finally:
        app.dependency_overrides.clear()

    statuses = sorted(r.status_code for r in results)
    assert statuses == [201, 409], f"Expected [201, 409], got {statuses}"
