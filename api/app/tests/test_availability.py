"""Tests for the slot availability calculation."""

from datetime import date, timedelta, datetime, UTC

import pytest
from httpx import AsyncClient

from app.models.business import Business
from app.models.service import Service
from app.models.working_hours import WorkingHours


def _next_sunday() -> date:
    """Return the next Sunday (or today if today is Sunday)."""
    today = date.today()
    days_ahead = (6 - today.weekday()) % 7  # days until Sunday (Python Sun=6)
    return today + timedelta(days=days_ahead if days_ahead > 0 else 7)


@pytest.mark.asyncio
async def test_slots_returns_empty_when_no_working_hours(
    client: AsyncClient,
    test_business: Business,
    test_service: Service,
) -> None:
    target = _next_sunday()
    response = await client.get(
        f"/api/v1/businesses/{test_business.id}/services/{test_service.id}/slots",
        params={"target_date": str(target)},
    )
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_slots_returns_available_times(
    client: AsyncClient,
    test_business: Business,
    test_service: Service,
    test_working_hours: WorkingHours,
) -> None:
    """With 9h window and 30-min service, expect 18 slots on a Sunday."""
    # test_working_hours is Sunday 09:00–18:00
    # Find the next Sunday
    target = _next_sunday()

    response = await client.get(
        f"/api/v1/businesses/{test_business.id}/services/{test_service.id}/slots",
        params={"target_date": str(target)},
    )
    assert response.status_code == 200
    slots = response.json()
    # 9h / 30min = 18 slots
    assert len(slots) == 18
    # All slots must have starts_at and ends_at
    for slot in slots:
        assert "starts_at" in slot
        assert "ends_at" in slot


@pytest.mark.asyncio
async def test_slots_missing_date_param(
    client: AsyncClient,
    test_business: Business,
    test_service: Service,
) -> None:
    response = await client.get(
        f"/api/v1/businesses/{test_business.id}/services/{test_service.id}/slots"
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_slots_open_duration_uses_60min_resolution(
    client: AsyncClient,
    test_business: Business,
    test_service_open_duration: Service,
    test_working_hours: WorkingHours,
) -> None:
    """Open-duration service (None) must generate 60-min slots: 9h window → 9 slots."""
    target = _next_sunday()
    response = await client.get(
        f"/api/v1/businesses/{test_business.id}/services/{test_service_open_duration.id}/slots",
        params={"target_date": str(target)},
    )
    assert response.status_code == 200
    slots = response.json()
    # 9h / 60min = 9 slots
    assert len(slots) == 9
    # Each slot spans exactly 60 minutes
    from datetime import datetime as _dt
    for slot in slots:
        start = _dt.fromisoformat(slot["starts_at"])
        end = _dt.fromisoformat(slot["ends_at"])
        assert (end - start).total_seconds() == 3600
