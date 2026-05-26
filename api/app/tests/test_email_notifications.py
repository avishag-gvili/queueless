"""Tests for email notifications on owner-initiated status changes."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.models.business import Business
from app.models.service import Service
from app.models.working_hours import WorkingHours


def _next_sunday_9am_utc() -> str:
    from datetime import date, datetime, timedelta, UTC
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_ahead if days_ahead > 0 else 7)
    naive = datetime(next_sunday.year, next_sunday.month, next_sunday.day, 6, 0, 0)
    return naive.replace(tzinfo=UTC).isoformat()


async def _book(client: AsyncClient, service: Service) -> str:
    """Create a guest booking and return the appointment ID."""
    resp = await client.post(
        "/api/v1/appointments",
        json={
            "service_id": str(service.id),
            "starts_at": _next_sunday_9am_utc(),
            "customer_name": "Test Customer",
            "customer_email": "customer@test.com",
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_owner_complete_sends_completed_email(
    client: AsyncClient,
    auth_headers: dict,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    appt_id = await _book(client, test_service)
    with patch(
        "app.services.booking.send_appointment_completed",
        new_callable=AsyncMock,
    ) as mock_send:
        resp = await client.patch(
            f"/api/v1/appointments/{appt_id}/status",
            json={"status": "completed"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        mock_send.assert_awaited_once()


@pytest.mark.asyncio
async def test_owner_cancel_sends_rejected_email(
    client: AsyncClient,
    auth_headers: dict,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    appt_id = await _book(client, test_service)
    with patch(
        "app.services.booking.send_appointment_rejected",
        new_callable=AsyncMock,
    ) as mock_send:
        resp = await client.patch(
            f"/api/v1/appointments/{appt_id}/status",
            json={"status": "cancelled"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        mock_send.assert_awaited_once()


@pytest.mark.asyncio
async def test_owner_no_show_sends_no_show_email(
    client: AsyncClient,
    auth_headers: dict,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    appt_id = await _book(client, test_service)
    with patch(
        "app.services.booking.send_appointment_no_show",
        new_callable=AsyncMock,
    ) as mock_send:
        resp = await client.patch(
            f"/api/v1/appointments/{appt_id}/status",
            json={"status": "no_show"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        mock_send.assert_awaited_once()


@pytest.mark.asyncio
async def test_owner_confirm_sends_approved_email(
    client: AsyncClient,
    auth_headers: dict,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    """Changing to confirmed sends the 'approved' email (future pending→confirmed flow)."""
    appt_id = await _book(client, test_service)
    with patch(
        "app.services.booking.send_appointment_approved",
        new_callable=AsyncMock,
    ) as mock_send:
        resp = await client.patch(
            f"/api/v1/appointments/{appt_id}/status",
            json={"status": "confirmed"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        mock_send.assert_awaited_once()
