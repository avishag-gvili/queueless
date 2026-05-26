from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_owned_business
from app.db.session import get_db
from app.models.business import Business
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate
from app.services import service as service_svc

router = APIRouter(prefix="/businesses/{business_id}/services", tags=["services"])


@router.post("", response_model=ServiceRead, status_code=201)
async def create_service(
    payload: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> ServiceRead:
    """Add a service to the business (owner only)."""
    svc = await service_svc.create_service(db, business, payload)
    return ServiceRead.model_validate(svc)


@router.get("", response_model=list[ServiceRead])
async def list_services(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> list[ServiceRead]:
    """List all active services for the business (owner only)."""
    services = await service_svc.list_services(db, business_id)
    return [ServiceRead.model_validate(s) for s in services]


@router.get("/{service_id}", response_model=ServiceRead)
async def get_service(
    service_id: UUID,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> ServiceRead:
    """Get a single service (owner only)."""
    svc = await service_svc.get_service_or_404(db, service_id, business.id)
    return ServiceRead.model_validate(svc)


@router.patch("/{service_id}", response_model=ServiceRead)
async def update_service(
    service_id: UUID,
    payload: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> ServiceRead:
    """Partially update a service (owner only)."""
    svc = await service_svc.get_service_or_404(db, service_id, business.id)
    updated = await service_svc.update_service(db, svc, payload)
    return ServiceRead.model_validate(updated)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: UUID,
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> None:
    """Soft-delete a service (owner only). Past appointments are preserved."""
    svc = await service_svc.get_service_or_404(db, service_id, business.id)
    await service_svc.deactivate_service(db, svc)
