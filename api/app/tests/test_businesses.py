import pytest
from httpx import AsyncClient

from app.models.business import Business, BusinessCategory


@pytest.mark.asyncio
async def test_create_business_seeds_default_working_hours(
    client: AsyncClient, auth_headers: dict
) -> None:
    """New business should have Sun–Fri hours pre-created; Saturday closed."""
    create = await client.post(
        "/api/v1/businesses",
        json={"name": "Seeded Salon"},
        headers=auth_headers,
    )
    assert create.status_code == 201
    biz_id = create.json()["id"]

    wh_resp = await client.get(
        f"/api/v1/businesses/{biz_id}/working-hours",
        headers=auth_headers,
    )
    assert wh_resp.status_code == 200
    hours = wh_resp.json()
    days_with_hours = {row["day_of_week"] for row in hours}

    # Sun–Thu (0–4) and Fri (5) should be open; Sat (6) closed
    assert days_with_hours == {0, 1, 2, 3, 4, 5}

    fri = next(h for h in hours if h["day_of_week"] == 5)
    assert fri["open_time"] == "09:00:00"
    assert fri["close_time"] == "13:00:00"


@pytest.mark.asyncio
async def test_create_business(client: AsyncClient, auth_headers: dict) -> None:
    response = await client.post(
        "/api/v1/businesses",
        json={"name": "Acme Salon"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Acme Salon"
    assert body["timezone"] == "Asia/Jerusalem"
    assert "id" in body


@pytest.mark.asyncio
async def test_create_business_requires_auth(client: AsyncClient) -> None:
    response = await client.post("/api/v1/businesses", json={"name": "Unauth"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_businesses_returns_own_only(client: AsyncClient, auth_headers: dict) -> None:
    await client.post("/api/v1/businesses", json={"name": "My Salon"}, headers=auth_headers)
    response = await client.get("/api/v1/businesses", headers=auth_headers)
    assert response.status_code == 200
    names = [b["name"] for b in response.json()]
    assert "My Salon" in names


@pytest.mark.asyncio
async def test_update_business(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.patch(
        f"/api/v1/businesses/{test_business.id}",
        json={"name": "Updated Name"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_business(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.delete(
        f"/api/v1/businesses/{test_business.id}",
        headers=auth_headers,
    )
    assert response.status_code == 204

    get_response = await client.get(
        f"/api/v1/businesses/{test_business.id}",
        headers=auth_headers,
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_cannot_access_other_owners_business(
    client: AsyncClient, test_business: Business
) -> None:
    # Register a second user
    await client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "password": "password123", "full_name": "Other"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "password123"},
    )
    other_token = login.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    response = await client.get(
        f"/api/v1/businesses/{test_business.id}",
        headers=other_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_business_defaults_category_to_other(
    client: AsyncClient, auth_headers: dict
) -> None:
    response = await client.post(
        "/api/v1/businesses",
        json={"name": "Default Cat"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["category"] == BusinessCategory.OTHER.value


@pytest.mark.asyncio
async def test_create_business_with_explicit_category(
    client: AsyncClient, auth_headers: dict
) -> None:
    response = await client.post(
        "/api/v1/businesses",
        json={"name": "Barber Shop", "category": "barbershop_men"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["category"] == "barbershop_men"


@pytest.mark.asyncio
async def test_update_business_category(
    client: AsyncClient, auth_headers: dict, test_business: Business
) -> None:
    response = await client.patch(
        f"/api/v1/businesses/{test_business.id}",
        json={"category": "personal_training"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["category"] == "personal_training"


@pytest.mark.asyncio
async def test_create_business_invalid_category(
    client: AsyncClient, auth_headers: dict
) -> None:
    response = await client.post(
        "/api/v1/businesses",
        json={"name": "Bad Cat", "category": "unknown_type"},
        headers=auth_headers,
    )
    assert response.status_code == 422
