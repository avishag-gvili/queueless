"""Public read-only endpoints — no authentication required."""
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.business import Business, BusinessCategory
from app.schemas.business import BusinessPublicRead, BusinessRead
from app.schemas.service import ServiceRead
from app.schemas.working_hours import WorkingHoursRead
from app.services import business as business_svc
from app.services import service as service_svc
from app.services import working_hours as wh_service

router = APIRouter(prefix="/public", tags=["public"])


class PublicBusinessList(BaseModel):
    items: list[BusinessPublicRead]
    total: int
    limit: int
    offset: int


@router.get("/businesses", response_model=PublicBusinessList)
async def list_businesses_public(
    q: str | None = Query(default=None, description="Search in name and description"),
    category: BusinessCategory | None = Query(default=None),
    city: str | None = Query(default=None, description="Filter by city (case-insensitive exact match)"),
    price_min: Decimal | None = Query(default=None, ge=0, description="Minimum service price"),
    price_max: Decimal | None = Query(default=None, ge=0, description="Maximum service price"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> PublicBusinessList:
    """List and search businesses without authentication."""
    items, total = await business_svc.list_public_businesses(
        db,
        q=q,
        category=category,
        city=city,
        price_min=price_min,
        price_max=price_max,
        limit=limit,
        offset=offset,
    )
    return PublicBusinessList(
        items=[BusinessPublicRead.model_validate(b) for b in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/cities", response_model=list[str])
async def list_cities_public(
    db: AsyncSession = Depends(get_db),
) -> list[str]:
    """Return distinct cities from all businesses, sorted alphabetically."""
    return await business_svc.list_public_cities(db)


@router.get("/businesses/{business_id}", response_model=BusinessRead)
async def get_business_public(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> BusinessRead:
    """Get business details without authentication."""
    business = await db.get(Business, business_id)
    if business is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business not found")
    return BusinessRead.model_validate(business)


@router.get("/businesses/{business_id}/services", response_model=list[ServiceRead])
async def list_services_public(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ServiceRead]:
    """List active services for a business without authentication."""
    business = await db.get(Business, business_id)
    if business is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business not found")
    services = await service_svc.list_services(db, business_id)
    return [ServiceRead.model_validate(s) for s in services]


@router.get("/businesses/{business_id}/working-hours", response_model=list[WorkingHoursRead])
async def list_working_hours_public(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[WorkingHoursRead]:
    """List working-hours for a business without authentication."""
    business = await db.get(Business, business_id)
    if business is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business not found")
    entries = await wh_service.list_working_hours(db, business_id)
    return [WorkingHoursRead.model_validate(e) for e in entries]
