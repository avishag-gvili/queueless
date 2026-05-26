import pytest
from httpx import AsyncClient

from app.models.business import Business


@pytest.mark.asyncio
async def test_create_working_hours(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.post(
        f"/api/v1/businesses/{test_business.id}/working-hours",
        json={"day_of_week": 1, "open_time": "09:00:00", "close_time": "17:00:00"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["day_of_week"] == 1
    assert body["open_time"] == "09:00:00"


@pytest.mark.asyncio
async def test_close_must_be_after_open(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.post(
        f"/api/v1/businesses/{test_business.id}/working-hours",
        json={"day_of_week": 1, "open_time": "17:00:00", "close_time": "09:00:00"},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_working_hours(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    await client.post(
        f"/api/v1/businesses/{test_business.id}/working-hours",
        json={"day_of_week": 0, "open_time": "09:00:00", "close_time": "18:00:00"},
        headers=auth_headers,
    )
    response = await client.get(
        f"/api/v1/businesses/{test_business.id}/working-hours",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.asyncio
async def test_delete_working_hours(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    create = await client.post(
        f"/api/v1/businesses/{test_business.id}/working-hours",
        json={"day_of_week": 2, "open_time": "08:00:00", "close_time": "16:00:00"},
        headers=auth_headers,
    )
    wh_id = create.json()["id"]

    response = await client.delete(
        f"/api/v1/businesses/{test_business.id}/working-hours/{wh_id}",
        headers=auth_headers,
    )
    assert response.status_code == 204
