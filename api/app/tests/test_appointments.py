"""Tests for the appointment booking flow."""

from datetime import date, datetime, timedelta, UTC

import pytest
from httpx import AsyncClient

from app.models.business import Business
from app.models.service import Service
from app.models.working_hours import WorkingHours


def _next_sunday_9am_utc(tz_offset_hours: int = 3) -> str:
    """Return the next Sunday at 09:00 Israel time as a UTC ISO string."""
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_ahead if days_ahead > 0 else 7)
    # 09:00 Israel (UTC+3) = 06:00 UTC
    naive = datetime(next_sunday.year, next_sunday.month, next_sunday.day, 6, 0, 0)
    return naive.replace(tzinfo=UTC).isoformat()


@pytest.mark.asyncio
async def test_guest_booking_succeeds(
    client: AsyncClient,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    response = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service.id),
            "starts_at": _next_sunday_9am_utc(),
            "customer_name": "Alice Guest",
            "customer_email": "alice@example.com",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["customer_name"] == "Alice Guest"
    assert body["status"] == "confirmed"
    assert body["customer_id"] is None


@pytest.mark.asyncio
async def test_authenticated_booking_sets_customer_id(
    client: AsyncClient,
    auth_headers: dict,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    response = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service.id),
            "starts_at": _next_sunday_9am_utc(),
            "customer_name": "Owner Books",
            "customer_email": "owner@example.com",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["customer_id"] is not None


@pytest.mark.asyncio
async def test_booking_past_time_rejected(
    client: AsyncClient,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    past = (datetime.now(UTC) - timedelta(hours=1)).isoformat()
    response = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service.id),
            "starts_at": past,
            "customer_name": "Attacker",
            "customer_email": "bad@example.com",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_booking_outside_working_hours_rejected(
    client: AsyncClient,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    """Sunday at 22:00 Israel time is outside the 09:00–18:00 window."""
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_ahead if days_ahead > 0 else 7)
    # 22:00 Israel (UTC+3) = 19:00 UTC
    late = datetime(next_sunday.year, next_sunday.month, next_sunday.day, 19, 0, 0, tzinfo=UTC)
    response = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service.id),
            "starts_at": late.isoformat(),
            "customer_name": "Night Owl",
            "customer_email": "owl@example.com",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_booking_open_duration_service_blocks_60min(
    client: AsyncClient,
    test_service_open_duration: Service,
    test_working_hours: WorkingHours,
) -> None:
    """Booking an open-duration service should allocate exactly 60 minutes."""
    response = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service_open_duration.id),
            "starts_at": _next_sunday_9am_utc(),
            "customer_name": "Open Client",
            "customer_email": "open@example.com",
        },
    )
    assert response.status_code == 201
    body = response.json()
    from datetime import datetime as _dt
    start = _dt.fromisoformat(body["starts_at"])
    end = _dt.fromisoformat(body["ends_at"])
    assert (end - start).total_seconds() == 3600


@pytest.mark.asyncio
async def test_cancel_appointment(
    client: AsyncClient,
    auth_headers: dict,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    create = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(test_service.id),
            "starts_at": _next_sunday_9am_utc(),
            "customer_name": "To Cancel",
            "customer_email": "cancel@example.com",
        },
        headers=auth_headers,
    )
    assert create.status_code == 201
    appt_id = create.json()["id"]

    response = await client.patch(
        f"/api/v1/appointments/{appt_id}/status",
        json={"status": "cancelled"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
