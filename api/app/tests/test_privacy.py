"""Tests for customer data retention and anonymization policy."""

from datetime import UTC, datetime, timedelta, time
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment, AppointmentStatus
from app.models.business import Business
from app.models.service import Service
from app.models.user import User
from app.models.working_hours import WorkingHours
from app.services.privacy import anonymize_due_appointments


def _next_sunday_9am_utc() -> str:
    from datetime import date
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_ahead if days_ahead > 0 else 7)
    naive = datetime(next_sunday.year, next_sunday.month, next_sunday.day, 6, 0, 0)
    return naive.replace(tzinfo=UTC).isoformat()


async def _create_completed_appointment(
    db: AsyncSession,
    service: Service,
    customer: User | None = None,
    customer_name: str = "Test Customer",
    customer_email: str = "customer@example.com",
) -> Appointment:
    """Insert a COMPLETED appointment directly into the DB."""
    from datetime import date
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_ahead if days_ahead > 0 else 7)
    starts_at = datetime(next_sunday.year, next_sunday.month, next_sunday.day, 6, 0, 0, tzinfo=UTC)
    ends_at = starts_at + timedelta(minutes=30)

    appt = Appointment(
        service_id=service.id,
        customer_id=customer.id if customer else None,
        customer_name=customer_name,
        customer_email=customer_email,
        starts_at=starts_at,
        ends_at=ends_at,
        status=AppointmentStatus.COMPLETED,
    )
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    return appt


@pytest.mark.asyncio
async def test_retention_zero_anonymizes_immediately(
    db: AsyncSession,
    test_business: Business,
    test_service: Service,
) -> None:
    """With retention_days=0 on the business, a COMPLETED appointment is anonymized immediately."""
    test_business.customer_data_retention_days = 0
    await db.commit()

    appt = await _create_completed_appointment(db, test_service)
    assert appt.anonymized_at is None

    count = await anonymize_due_appointments(db)
    assert count == 1

    await db.refresh(appt)
    assert appt.customer_name == "[נמחק]"
    assert appt.customer_email == "anonymized@deleted.local"
    assert appt.customer_phone is None
    assert appt.anonymized_at is not None


@pytest.mark.asyncio
async def test_retention_30_days_not_yet_due(
    db: AsyncSession,
    test_business: Business,
    test_service: Service,
) -> None:
    """With retention_days=30, a fresh COMPLETED appointment is NOT anonymized yet."""
    test_business.customer_data_retention_days = 30
    await db.commit()

    appt = await _create_completed_appointment(db, test_service)

    count = await anonymize_due_appointments(db)
    assert count == 0

    await db.refresh(appt)
    assert appt.customer_name == "Test Customer"
    assert appt.anonymized_at is None


@pytest.mark.asyncio
async def test_retention_30_days_past_due(
    db: AsyncSession,
    test_business: Business,
    test_service: Service,
) -> None:
    """With retention_days=30, an appointment completed 31 days ago IS anonymized."""
    test_business.customer_data_retention_days = 30
    await db.commit()

    appt = await _create_completed_appointment(db, test_service)

    # Simulate 31 days having passed since completion; expire to force fresh load
    old_updated_at = datetime.now(UTC) - timedelta(days=31)
    await db.execute(
        text("UPDATE appointments SET updated_at = :ts WHERE id = :id"),
        {"ts": old_updated_at, "id": appt.id},
    )
    await db.commit()
    db.expire_all()

    count = await anonymize_due_appointments(db)
    assert count == 1

    await db.refresh(appt)
    assert appt.customer_name == "[נמחק]"
    assert appt.anonymized_at is not None


@pytest.mark.asyncio
async def test_service_override_beats_business_default(
    db: AsyncSession,
    test_business: Business,
    test_service: Service,
) -> None:
    """Service-level override (0 days) takes precedence over business default (90 days)."""
    test_business.customer_data_retention_days = 90
    test_service.customer_data_retention_days_override = 0
    await db.commit()

    appt = await _create_completed_appointment(db, test_service)

    count = await anonymize_due_appointments(db)
    assert count == 1

    await db.refresh(appt)
    assert appt.customer_name == "[נמחק]"
    assert appt.anonymized_at is not None


@pytest.mark.asyncio
async def test_anonymized_appointments_hidden_from_customer(
    db: AsyncSession,
    client: AsyncClient,
    test_user: User,
    auth_headers: dict,
    test_business: Business,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    """Anonymized appointments are excluded from the customer's own list.
    The owner can still see the appointment (it just shows redacted PII).
    """
    test_business.customer_data_retention_days = 0
    await db.commit()

    # Book an appointment as the authenticated customer
    book_resp = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service.id),
            "starts_at": _next_sunday_9am_utc(),
            "customer_name": "Real Name",
            "customer_email": "real@example.com",
        },
        headers=auth_headers,
    )
    assert book_resp.status_code == 201
    appt_id = book_resp.json()["id"]

    # Owner completes the appointment — triggers lazy anonymization with retention=0
    with patch("app.services.email.sender.send_appointment_completed"):
        status_resp = await client.patch(
            f"/api/v1/appointments/{appt_id}/status",
            json={"status": "completed"},
            headers=auth_headers,
        )
    assert status_resp.status_code == 200

    # Customer's own list must NOT contain the anonymized appointment
    my_resp = await client.get("/api/v1/appointments/my", headers=auth_headers)
    assert my_resp.status_code == 200
    my_appts = my_resp.json()
    assert not any(a["id"] == appt_id for a in my_appts)

    # Owner's business list DOES contain it (with redacted PII)
    owner_resp = await client.get(
        f"/api/v1/businesses/{test_business.id}/appointments",
        headers=auth_headers,
    )
    assert owner_resp.status_code == 200
    owner_appts = owner_resp.json()
    matching = [a for a in owner_appts if a["id"] == appt_id]
    assert len(matching) == 1
    assert matching[0]["customer_name"] == "[נמחק]"
    assert matching[0]["anonymized_at"] is not None
