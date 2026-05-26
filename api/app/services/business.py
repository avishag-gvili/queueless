import logging
from datetime import time

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Business, BusinessCategory
from app.models.service import Service
from app.models.user import User
from app.models.working_hours import WorkingHours
from app.schemas.business import BusinessCreate, BusinessUpdate

logger = logging.getLogger(__name__)

# Sun=0..Thu=4: 09:00–17:00 | Fri=5: 09:00–13:00 | Sat=6: closed
_DEFAULT_HOURS: list[tuple[int, time, time]] = [
    (0, time(9, 0), time(17, 0)),
    (1, time(9, 0), time(17, 0)),
    (2, time(9, 0), time(17, 0)),
    (3, time(9, 0), time(17, 0)),
    (4, time(9, 0), time(17, 0)),
    (5, time(9, 0), time(13, 0)),
]


async def create_business(db: AsyncSession, payload: BusinessCreate, owner: User) -> Business:
    """Create a new business and seed it with default working hours."""
    business = Business(
        owner_id=owner.id,
        name=payload.name,
        description=payload.description,
        city=payload.city,
        timezone="Asia/Jerusalem",
        category=payload.category,
    )
    db.add(business)
    await db.flush()  # get business.id before adding working hours

    for day, open_t, close_t in _DEFAULT_HOURS:
        db.add(
            WorkingHours(
                business_id=business.id,
                day_of_week=day,
                open_time=open_t,
                close_time=close_t,
            )
        )

    await db.commit()
    await db.refresh(business)
    logger.info("Created business %s for user %s", business.id, owner.id)
    return business


async def list_businesses(db: AsyncSession, owner: User) -> list[Business]:
    """Return all businesses owned by the given user."""
    result = await db.execute(
        select(Business).where(Business.owner_id == owner.id).order_by(Business.created_at)
    )
    return list(result.scalars().all())


async def update_business(
    db: AsyncSession, business: Business, payload: BusinessUpdate
) -> Business:
    """Apply a partial update to a business."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(business, field, value)
    await db.commit()
    await db.refresh(business)
    return business


async def delete_business(db: AsyncSession, business: Business) -> None:
    """Hard-delete a business and cascade to all its services and appointments."""
    await db.delete(business)
    await db.commit()
    logger.info("Deleted business %s", business.id)


async def list_public_businesses(
    db: AsyncSession,
    *,
    q: str | None = None,
    category: BusinessCategory | None = None,
    city: str | None = None,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Business], int]:
    """Return paginated public businesses with optional filters."""
    base_filter = []

    if q:
        pattern = f"%{q}%"
        base_filter.append(
            func.lower(Business.name).like(func.lower(pattern))
            | func.lower(Business.description).like(func.lower(pattern))
        )
    if category is not None:
        base_filter.append(Business.category == category)
    if city is not None:
        base_filter.append(func.lower(Business.city) == func.lower(city))

    # Price filter: business must have at least one active service within [price_min, price_max]
    if price_min is not None or price_max is not None:
        price_conditions = [Service.active.is_(True), Service.price.is_not(None)]
        if price_min is not None:
            price_conditions.append(Service.price >= price_min)
        if price_max is not None:
            price_conditions.append(Service.price <= price_max)
        price_subq = (
            select(Service.business_id)
            .where(*price_conditions)
            .correlate(Business)
            .exists()
        )
        base_filter.append(price_subq)

    count_result = await db.execute(
        select(func.count()).select_from(Business).where(*base_filter)
    )
    total: int = count_result.scalar_one()

    items_result = await db.execute(
        select(Business)
        .where(*base_filter)
        .order_by(Business.name)
        .limit(limit)
        .offset(offset)
    )
    items = list(items_result.scalars().all())
    return items, total


async def list_public_cities(db: AsyncSession) -> list[str]:
    """Return distinct, non-null cities from all businesses, sorted alphabetically."""
    result = await db.execute(
        select(Business.city)
        .where(Business.city.is_not(None))
        .distinct()
        .order_by(Business.city)
    )
    return [row[0] for row in result.all() if row[0]]
