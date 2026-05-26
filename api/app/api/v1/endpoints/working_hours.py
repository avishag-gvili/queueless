from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_owned_business
from app.db.session import get_db
from app.models.business import Business
from app.schemas.working_hours import WorkingHoursCreate, WorkingHoursRead, WorkingHoursUpdate
from app.services import working_hours as wh_service

router = APIRouter(prefix="/businesses/{business_id}/working-hours", tags=["working-hours"])


@router.post("", response_model=WorkingHoursRead, status_code=201)
async def create_working_hours(
    payload: WorkingHoursCreate,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> WorkingHoursRead:
    """Add a working-hours window for a day (owner only)."""
    wh = await wh_service.create_working_hours(db, business, payload)
    return WorkingHoursRead.model_validate(wh)


@router.get("", response_model=list[WorkingHoursRead])
async def list_working_hours(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> list[WorkingHoursRead]:
    """List all working-hours windows for the business (owner only)."""
    entries = await wh_service.list_working_hours(db, business_id)
    return [WorkingHoursRead.model_validate(e) for e in entries]


@router.patch("/{wh_id}", response_model=WorkingHoursRead)
async def update_working_hours(
    wh_id: UUID,
    payload: WorkingHoursUpdate,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> WorkingHoursRead:
    """Update a working-hours entry (owner only)."""
    wh = await wh_service.get_working_hours_or_404(db, wh_id, business.id)
    updated = await wh_service.update_working_hours(db, wh, payload)
    return WorkingHoursRead.model_validate(updated)


@router.delete("/{wh_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_working_hours(
    wh_id: UUID,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> None:
    """Remove a working-hours window (owner only)."""
    wh = await wh_service.get_working_hours_or_404(db, wh_id, business.id)
    await wh_service.delete_working_hours(db, wh)
