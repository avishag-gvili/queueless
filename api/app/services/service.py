import logging
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.business import Business
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate

logger = logging.getLogger(__name__)


async def create_service(
    db: AsyncSession, business: Business, payload: ServiceCreate
) -> Service:
    """Add a service to a business."""
    svc = Service(
        business_id=business.id,
        name=payload.name,
        description=payload.description,
        duration_minutes=payload.duration_minutes,  # None = open duration
        price=payload.price,
    )
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    logger.info("Created service %s for business %s", svc.id, business.id)
    return svc


async def list_services(db: AsyncSession, business_id: UUID) -> list[Service]:
    """Return all active services for a business."""
    result = await db.execute(
        select(Service)
        .where(Service.business_id == business_id, Service.active.is_(True))
        .order_by(Service.name)
    )
    return list(result.scalars().all())


async def get_service_or_404(db: AsyncSession, service_id: UUID, business_id: UUID) -> Service:
    """Fetch an active service by ID, scoped to the given business."""
    svc = await db.get(Service, service_id)
    if svc is None or svc.business_id != business_id or not svc.active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    return svc


async def update_service(db: AsyncSession, svc: Service, payload: ServiceUpdate) -> Service:
    """Apply a partial update to a service."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(svc, field, value)
    await db.commit()
    await db.refresh(svc)
    return svc


async def deactivate_service(db: AsyncSession, svc: Service) -> None:
    """Soft-delete: mark the service inactive so past appointments still reference it."""
    svc.active = False
    await db.commit()
    logger.info("Deactivated service %s", svc.id)
