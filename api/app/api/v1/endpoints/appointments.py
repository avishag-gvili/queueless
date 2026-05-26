from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_current_user_optional, get_owned_business
from app.core.exceptions import OutOfHoursError, ServiceInactiveError, SlotTakenError
from app.db.session import get_db
from app.models.business import Business
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentStatusUpdate
from app.models.service import Service
from app.schemas.slot import SlotRead
from app.services import availability as availability_service
from app.services import booking as booking_service
from app.services import service as service_svc

router = APIRouter(tags=["appointments"])


@router.get(
    "/businesses/{business_id}/services/{service_id}/slots",
    response_model=list[SlotRead],
)
async def get_slots(
    business_id: UUID,
    service_id: UUID,
    target_date: date = Query(..., description="Date to check availability (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
) -> list[SlotRead]:
    """Return available appointment slots for a service on a given date (public)."""
    business = await db.get(Business, business_id)
    if business is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business not found")
    svc = await service_svc.get_service_or_404(db, service_id, business_id)
    return await availability_service.get_available_slots(db, business, svc, target_date)


@router.post("/appointments", response_model=AppointmentRead, status_code=201)
async def create_appointment(
    payload: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> AppointmentRead:
    """Book an appointment (guest or authenticated customer)."""
    # Resolve the service without requiring ownership (public booking endpoint)
    svc = await db.get(Service, payload.service_id)
    if svc is None or not svc.active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")

    try:
        appt = await booking_service.create_appointment(db, svc, payload, current_user)
    except SlotTakenError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    except OutOfHoursError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from exc
    except ServiceInactiveError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc

    return AppointmentRead.model_validate(appt)


@router.get("/appointments/my", response_model=list[AppointmentRead])
async def list_my_appointments(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AppointmentRead]:
    """List the authenticated customer's own appointments, newest first."""
    appointments = await booking_service.list_my_appointments(db, current_user.id, limit, offset)
    return [AppointmentRead.model_validate(a) for a in appointments]


@router.get(
    "/businesses/{business_id}/appointments",
    response_model=list[AppointmentRead],
)
async def list_appointments(
    business_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    business: Business = Depends(get_owned_business),
) -> list[AppointmentRead]:
    """List paginated appointments for a business (owner only)."""
    appointments = await booking_service.list_business_appointments(db, business_id, limit, offset)
    return [AppointmentRead.model_validate(a) for a in appointments]


@router.get("/appointments/{appointment_id}", response_model=AppointmentRead)
async def get_appointment(
    appointment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppointmentRead:
    """Get a single appointment (customer who booked it, or business owner)."""
    appt = await booking_service.get_appointment_or_404(db, appointment_id)

    # Allow access if the user is the customer or the business owner
    svc = await db.get(Service, appt.service_id)
    if svc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")

    business = await db.get(Business, svc.business_id)
    is_owner = business is not None and business.owner_id == current_user.id
    is_customer = appt.customer_id == current_user.id

    if not is_owner and not is_customer:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied")

    return AppointmentRead.model_validate(appt)


@router.patch("/appointments/{appointment_id}/status", response_model=AppointmentRead)
async def update_appointment_status(
    appointment_id: UUID,
    payload: AppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppointmentRead:
    """Update appointment status (owner: any transition; customer: cancel only)."""
    from app.models.appointment import AppointmentStatus

    appt = await booking_service.get_appointment_or_404(db, appointment_id)
    svc = await db.get(Service, appt.service_id)
    if svc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")

    business = await db.get(Business, svc.business_id)
    is_owner = business is not None and business.owner_id == current_user.id
    is_customer = appt.customer_id == current_user.id

    if not is_owner and not is_customer:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied")

    # Customers can only cancel their own appointment
    if is_customer and not is_owner and payload.status != AppointmentStatus.CANCELLED:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Customers may only cancel appointments")

    updated = await booking_service.update_appointment_status(db, appt, payload, actor=current_user)
    return AppointmentRead.model_validate(updated)
