import hashlib
import logging
from datetime import datetime, timedelta, UTC
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import OutOfHoursError, ServiceInactiveError, SlotTakenError
from app.models.appointment import Appointment, AppointmentStatus
from app.models.business import Business
from app.models.service import Service
from app.models.user import User
from app.models.working_hours import WorkingHours
from app.schemas.appointment import AppointmentCreate, AppointmentStatusUpdate
from app.services import privacy as privacy_service
from app.services.email.sender import (
    send_booking_cancellation,
    send_booking_confirmation,
    send_appointment_approved,
    send_appointment_completed,
    send_appointment_no_show,
    send_appointment_rejected,
    send_appointment_status_changed,
)

logger = logging.getLogger(__name__)


async def create_appointment(
    db: AsyncSession,
    service: Service,
    payload: AppointmentCreate,
    customer: User | None,
) -> Appointment:
    """Book an appointment with row-level locking to prevent double-booking.

    Raises SlotTakenError on conflict, OutOfHoursError if outside working hours,
    and ServiceInactiveError if the service is no longer active.
    """
    if not service.active:
        raise ServiceInactiveError("Service is no longer available")

    starts_at = payload.starts_at
    if starts_at.tzinfo is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "starts_at must be timezone-aware")

    # Normalise to UTC
    starts_at = starts_at.astimezone(UTC)
    duration = service.duration_minutes if service.duration_minutes is not None else settings.default_slot_resolution_minutes
    ends_at = starts_at + timedelta(minutes=duration)

    if starts_at <= datetime.now(UTC):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Appointment must be in the future")

    # Advisory lock serializes concurrent requests for the same business+slot.
    # FOR UPDATE on existing rows alone cannot prevent two simultaneous inserts into
    # an empty slot because there would be no rows to lock. The advisory lock ensures
    # only one transaction at a time can reach the conflict check for this slot.
    # pg_advisory_xact_lock is released automatically when the transaction ends.
    lock_key = _slot_lock_key(service.business_id, starts_at)
    await db.execute(text(f"SELECT pg_advisory_xact_lock({lock_key})"))

    conflicting = await db.execute(
        select(Appointment)
        .join(Service)
        .where(
            Service.business_id == service.business_id,
            Appointment.status != AppointmentStatus.CANCELLED,
            Appointment.starts_at < ends_at,
            Appointment.ends_at > starts_at,
        )
    )
    if conflicting.first() is not None:
        raise SlotTakenError("That slot was just booked")

    # Defensive re-check: ensure the slot is within working hours
    await _assert_within_working_hours(db, service.business_id, starts_at, ends_at)

    appointment = Appointment(
        service_id=service.id,
        customer_id=customer.id if customer else None,
        customer_name=payload.customer_name,
        customer_email=str(payload.customer_email),
        customer_phone=payload.customer_phone,
        starts_at=starts_at,
        ends_at=ends_at,
        notes=payload.notes,
        status=AppointmentStatus.CONFIRMED,
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    logger.info("Created appointment %s for service %s", appointment.id, service.id)

    await send_booking_confirmation(appointment)
    # TODO(phase-2): schedule reminder job for starts_at - 24h

    return appointment


async def update_appointment_status(
    db: AsyncSession,
    appointment: Appointment,
    payload: AppointmentStatusUpdate,
    actor: User | None = None,
) -> Appointment:
    """Update an appointment's status and send the appropriate email notification.

    actor: the User making the change. If actor is the business owner (or system),
    owner-initiated templates are used. If actor is the customer, the generic
    booking_cancellation template is used for cancellations.
    """
    appointment.status = payload.status
    await db.commit()
    await db.refresh(appointment)

    # Determine whether this is an owner-initiated action
    is_owner_action = actor is None or str(actor.id) != str(appointment.customer_id)

    if payload.status == AppointmentStatus.CANCELLED:
        if is_owner_action:
            await send_appointment_rejected(appointment)
        else:
            await send_booking_cancellation(appointment)
    elif payload.status == AppointmentStatus.CONFIRMED:
        await send_appointment_approved(appointment)
    elif payload.status == AppointmentStatus.COMPLETED:
        await send_appointment_completed(appointment)
        # Run lazy anonymization — 0-retention businesses are anonymized immediately
        await privacy_service.anonymize_due_appointments(db)
    elif payload.status == AppointmentStatus.NO_SHOW:
        await send_appointment_no_show(appointment)
    else:
        await send_appointment_status_changed(appointment, payload.status.value)

    return appointment


async def get_appointment_or_404(db: AsyncSession, appointment_id: UUID) -> Appointment:
    """Fetch an appointment by ID; raises 404 if not found."""
    appt = await db.get(Appointment, appointment_id)
    if appt is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")
    return appt


async def list_business_appointments(
    db: AsyncSession,
    business_id: UUID,
    limit: int,
    offset: int,
) -> list[Appointment]:
    """Return paginated appointments for all services of a business, newest first.

    Runs a lazy anonymization sweep before returning results.
    """
    await privacy_service.anonymize_due_appointments(db)

    result = await db.execute(
        select(Appointment)
        .join(Service)
        .where(Service.business_id == business_id)
        .order_by(Appointment.starts_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def list_my_appointments(
    db: AsyncSession,
    customer_id: UUID,
    limit: int,
    offset: int,
) -> list[Appointment]:
    """Return the customer's own non-anonymized appointments, newest first.

    Anonymized appointments are excluded: the system has forgotten who they were,
    which is the intended privacy posture.
    """
    from sqlalchemy.orm import selectinload

    await privacy_service.anonymize_due_appointments(db)

    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.service).selectinload(Service.business))
        .where(
            Appointment.customer_id == customer_id,
            Appointment.anonymized_at.is_(None),
        )
        .order_by(Appointment.starts_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


def _slot_lock_key(business_id: UUID, starts_at: datetime) -> int:
    """Return a 63-bit advisory lock key for the given business+slot combination."""
    digest = hashlib.sha256(f"{business_id}:{starts_at.isoformat()}".encode()).digest()
    return int.from_bytes(digest[:8], "big") & 0x7FFFFFFFFFFFFFFF


async def _assert_within_working_hours(
    db: AsyncSession,
    business_id: UUID,
    starts_at: datetime,
    ends_at: datetime,
) -> None:
    """Raise OutOfHoursError if the time range falls outside any working-hours window."""
    business = await db.get(Business, business_id)
    if business is None:
        raise OutOfHoursError("Business not found")

    from zoneinfo import ZoneInfo

    tz = ZoneInfo(business.timezone)
    local_start = starts_at.astimezone(tz)
    local_end = ends_at.astimezone(tz)

    # day_of_week conversion: Python weekday() Mon=0..Sun=6 → our Sun=0..Sat=6
    day_of_week = (local_start.weekday() + 1) % 7

    result = await db.execute(
        select(WorkingHours).where(
            WorkingHours.business_id == business_id,
            WorkingHours.day_of_week == day_of_week,
        )
    )
    windows = result.scalars().all()

    start_time = local_start.time().replace(tzinfo=None)
    end_time = local_end.time().replace(tzinfo=None)

    for window in windows:
        if window.open_time <= start_time and end_time <= window.close_time:
            return

    raise OutOfHoursError("Requested time is outside working hours")
