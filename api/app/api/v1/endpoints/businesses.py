from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_owned_business
from app.db.session import get_db
from app.models.business import Business
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessRead, BusinessUpdate
from app.services import business as business_service

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.post("", response_model=BusinessRead, status_code=201)
async def create_business(
    payload: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BusinessRead:
    """Create a new business for the authenticated user."""
    biz = await business_service.create_business(db, payload, current_user)
    return BusinessRead.model_validate(biz)


@router.get("", response_model=list[BusinessRead])
async def list_my_businesses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BusinessRead]:
    """List all businesses owned by the authenticated user."""
    businesses = await business_service.list_businesses(db, current_user)
    return [BusinessRead.model_validate(b) for b in businesses]


@router.get("/{business_id}", response_model=BusinessRead)
async def get_business(
    business: Business = Depends(get_owned_business),
) -> BusinessRead:
    """Get a specific business (owner only)."""
    return BusinessRead.model_validate(business)


@router.patch("/{business_id}", response_model=BusinessRead)
async def update_business(
    payload: BusinessUpdate,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> BusinessRead:
    """Partially update a business (owner only)."""
    updated = await business_service.update_business(db, business, payload)
    return BusinessRead.model_validate(updated)


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> None:
    """Hard-delete a business and all its data (owner only)."""
    await business_service.delete_business(db, business)
