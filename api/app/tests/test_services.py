import pytest
from httpx import AsyncClient

from app.models.business import Business
from app.models.service import Service


@pytest.mark.asyncio
async def test_create_service(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.post(
        f"/api/v1/businesses/{test_business.id}/services",
        json={"name": "Haircut", "duration_minutes": 30},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Haircut"
    assert body["duration_minutes"] == 30
    assert body["active"] is True


@pytest.mark.asyncio
async def test_create_service_without_duration_is_open_ended(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.post(
        f"/api/v1/businesses/{test_business.id}/services",
        json={"name": "Open Service"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["duration_minutes"] is None


@pytest.mark.asyncio
async def test_service_duration_must_be_positive(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.post(
        f"/api/v1/businesses/{test_business.id}/services",
        json={"name": "Bad", "duration_minutes": 0},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_service_duration_max_480(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.post(
        f"/api/v1/businesses/{test_business.id}/services",
        json={"name": "Too Long", "duration_minutes": 481},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_services(
    client: AsyncClient, auth_headers: dict, test_business: Business, test_service: Service
) -> None:
    response = await client.get(
        f"/api/v1/businesses/{test_business.id}/services",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert any(s["id"] == str(test_service.id) for s in response.json())


@pytest.mark.asyncio
async def test_soft_delete_service(
    client: AsyncClient, auth_headers: dict, test_business: Business, test_service: Service
) -> None:
    response = await client.delete(
        f"/api/v1/businesses/{test_business.id}/services/{test_service.id}",
        headers=auth_headers,
    )
    assert response.status_code == 204

    # Service no longer appears in the list (active=False)
    list_response = await client.get(
        f"/api/v1/businesses/{test_business.id}/services",
        headers=auth_headers,
    )
    assert all(s["id"] != str(test_service.id) for s in list_response.json())
