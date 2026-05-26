from datetime import date, datetime, time, timedelta, UTC
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.appointment import Appointment, AppointmentStatus
from app.models.business import Business
from app.models.service import Service
from app.models.working_hours import WorkingHours
from app.schemas.slot import SlotRead


async def get_available_slots(
    db: AsyncSession,
    business: Business,
    service: Service,
    target_date: date,
) -> list[SlotRead]:
    """Compute available appointment slots for a service on a given date.

    Slots are anchored at window_start + multiples of service.duration_minutes.
    This keeps times predictable — we don't try to fit slots into gaps.
    """
    tz = ZoneInfo(business.timezone)

    # Convert Python weekday (Mon=0..Sun=6) to our convention (Sun=0..Sat=6)
    day_of_week = (target_date.weekday() + 1) % 7

    windows_result = await db.execute(
        select(WorkingHours).where(
            WorkingHours.business_id == business.id,
            WorkingHours.day_of_week == day_of_week,
        )
    )
    windows = list(windows_result.scalars().all())
    if not windows:
        return []

    # Fetch all non-cancelled appointments across all services of this business on target_date
    day_start_utc = datetime.combine(target_date, time.min, tzinfo=tz).astimezone(ZoneInfo("UTC"))
    day_end_utc = day_start_utc + timedelta(days=1)

    existing_result = await db.execute(
        select(Appointment)
        .join(Service)
        .where(
            Service.business_id == business.id,
            Appointment.status != AppointmentStatus.CANCELLED,
            Appointment.starts_at < day_end_utc,
            Appointment.ends_at > day_start_utc,
        )
    )
    existing = list(existing_result.scalars().all())

    # Use configured resolution when service has no fixed duration (open-ended)
    duration = service.duration_minutes if service.duration_minutes is not None else settings.default_slot_resolution_minutes
    step = timedelta(minutes=duration)
    slots: list[SlotRead] = []

    for window in windows:
        candidate = datetime.combine(target_date, window.open_time, tzinfo=tz)
        window_end = datetime.combine(target_date, window.close_time, tzinfo=tz)

        # Slots are anchored to window start + multiples of duration.
        # Predictable times beat clever gap-fitting from a UX standpoint.
        while candidate + step <= window_end:
            slot_end = candidate + step
            candidate_utc = candidate.astimezone(ZoneInfo("UTC"))
            slot_end_utc = slot_end.astimezone(ZoneInfo("UTC"))

            overlaps = any(
                a.starts_at < slot_end_utc and a.ends_at > candidate_utc for a in existing
            )
            if not overlaps:
                slots.append(SlotRead(starts_at=candidate_utc, ends_at=slot_end_utc))

            candidate += step

    return slots
