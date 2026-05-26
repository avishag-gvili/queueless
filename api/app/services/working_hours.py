import logging
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Business
from app.models.working_hours import WorkingHours
from app.schemas.working_hours import WorkingHoursCreate, WorkingHoursUpdate

logger = logging.getLogger(__name__)


async def create_working_hours(
    db: AsyncSession, business: Business, payload: WorkingHoursCreate
) -> WorkingHours:
    """Add a working-hours window for the business."""
    wh = WorkingHours(
        business_id=business.id,
        day_of_week=payload.day_of_week,
        open_time=payload.open_time,
        close_time=payload.close_time,
    )
    db.add(wh)
    await db.commit()
    await db.refresh(wh)
    logger.info("Created working hours %s for business %s", wh.id, business.id)
    return wh


async def list_working_hours(db: AsyncSession, business_id: UUID) -> list[WorkingHours]:
    """Return all working-hours windows for a business, sorted by day and open time."""
    result = await db.execute(
        select(WorkingHours)
        .where(WorkingHours.business_id == business_id)
        .order_by(WorkingHours.day_of_week, WorkingHours.open_time)
    )
    return list(result.scalars().all())


async def get_working_hours_or_404(
    db: AsyncSession, wh_id: UUID, business_id: UUID
) -> WorkingHours:
    """Fetch a working-hours entry scoped to the given business."""
    wh = await db.get(WorkingHours, wh_id)
    if wh is None or wh.business_id != business_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Working hours entry not found")
    return wh


async def update_working_hours(
    db: AsyncSession, wh: WorkingHours, payload: WorkingHoursUpdate
) -> WorkingHours:
    """Apply a partial update to a working-hours entry."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(wh, field, value)
    await db.commit()
    await db.refresh(wh)
    return wh


async def delete_working_hours(db: AsyncSession, wh: WorkingHours) -> None:
    """Remove a working-hours window."""
    await db.delete(wh)
    await db.commit()
    logger.info("Deleted working hours %s", wh.id)
