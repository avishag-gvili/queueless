"""Customer PII anonymization based on per-business/service retention policy.

Anonymization is lazy — it runs when appointments are queried or when an
appointment is completed, not on a schedule.

# TODO(phase-2): replace lazy anonymization with a scheduled job that runs
# nightly to catch any appointments not caught by the lazy sweep.
"""
import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment, AppointmentStatus
from app.models.service import Service

logger = logging.getLogger(__name__)

_ANONYMIZED_NAME = "[נמחק]"
_ANONYMIZED_EMAIL = "anonymized@deleted.local"


async def anonymize_due_appointments(db: AsyncSession) -> int:
    """Anonymize customer PII for completed appointments past their retention window.

    Returns the count of appointments anonymized in this run.
    """
    result = await db.execute(
        select(Appointment)
        .options(
            selectinload(Appointment.service).selectinload(Service.business),
        )
        .where(
            Appointment.status == AppointmentStatus.COMPLETED,
            Appointment.anonymized_at.is_(None),
        )
    )
    appointments = list(result.scalars().all())

    now = datetime.now(UTC)
    anonymized_count = 0

    for appt in appointments:
        service = appt.service
        if service is None:
            continue
        business = getattr(service, "business", None)
        if business is None:
            continue

        # Service-level override takes precedence over business default
        retention_days: int = (
            service.customer_data_retention_days_override
            if service.customer_data_retention_days_override is not None
            else business.customer_data_retention_days
        )

        # Use updated_at as proxy for completion time
        completion_time = appt.updated_at
        if completion_time.tzinfo is None:
            completion_time = completion_time.replace(tzinfo=UTC)

        due_at = completion_time + timedelta(days=retention_days)

        if now >= due_at:
            appt.customer_name = _ANONYMIZED_NAME
            appt.customer_email = _ANONYMIZED_EMAIL
            appt.customer_phone = None
            appt.anonymized_at = now
            anonymized_count += 1
            logger.info("Anonymized appointment %s (retention=%d days)", appt.id, retention_days)

    if anonymized_count > 0:
        await db.commit()

    return anonymized_count
