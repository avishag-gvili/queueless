import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Business, BusinessCategory
from app.models.user import User


async def _make_business(
    db: AsyncSession,
    owner: User,
    name: str,
    category: BusinessCategory = BusinessCategory.OTHER,
    description: str | None = None,
) -> Business:
    biz = Business(
        owner_id=owner.id,
        name=name,
        category=category,
        description=description,
        timezone="Asia/Jerusalem",
    )
    db.add(biz)
    await db.commit()
    await db.refresh(biz)
    return biz


@pytest.mark.asyncio
async def test_list_public_businesses_returns_all(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Alpha Salon")
    await _make_business(db, test_user, "Beta Gym")

    response = await client.get("/api/v1/public/businesses")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2


@pytest.mark.asyncio
async def test_list_public_businesses_no_auth_required(client: AsyncClient) -> None:
    response = await client.get("/api/v1/public/businesses")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_public_businesses_search_by_name(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Rainbow Barber")
    await _make_business(db, test_user, "Fitness World")

    response = await client.get("/api/v1/public/businesses?q=rainbow")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Rainbow Barber"


@pytest.mark.asyncio
async def test_list_public_businesses_search_by_description(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Spa A", description="great massage therapy")
    await _make_business(db, test_user, "Gym B", description="weights and cardio")

    response = await client.get("/api/v1/public/businesses?q=massage")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Spa A"


@pytest.mark.asyncio
async def test_list_public_businesses_filter_by_category(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Cut & Go", category=BusinessCategory.BARBERSHOP_MEN)
    await _make_business(db, test_user, "Iron Gym", category=BusinessCategory.PERSONAL_TRAINING)
    await _make_business(db, test_user, "Nail Art", category=BusinessCategory.NAIL_SALON)

    response = await client.get("/api/v1/public/businesses?category=personal_training")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Iron Gym"


@pytest.mark.asyncio
async def test_list_public_businesses_combined_filter(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Healthy Gym", category=BusinessCategory.PERSONAL_TRAINING)
    await _make_business(db, test_user, "Healthy Spa", category=BusinessCategory.MASSAGE)
    await _make_business(db, test_user, "Quick Cut", category=BusinessCategory.BARBERSHOP_MEN)

    response = await client.get("/api/v1/public/businesses?q=healthy&category=personal_training")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Healthy Gym"


@pytest.mark.asyncio
async def test_list_public_businesses_pagination(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    for i in range(5):
        await _make_business(db, test_user, f"Business {i:02d}")

    page1 = await client.get("/api/v1/public/businesses?limit=2&offset=0")
    assert page1.status_code == 200
    body1 = page1.json()
    assert body1["total"] == 5
    assert len(body1["items"]) == 2

    page2 = await client.get("/api/v1/public/businesses?limit=2&offset=2")
    body2 = page2.json()
    assert len(body2["items"]) == 2
    # Pages should not overlap
    names1 = {b["name"] for b in body1["items"]}
    names2 = {b["name"] for b in body2["items"]}
    assert names1.isdisjoint(names2)


@pytest.mark.asyncio
async def test_list_public_businesses_results_ordered_by_name(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Zebra Salon")
    await _make_business(db, test_user, "Alpha Gym")
    await _make_business(db, test_user, "Mango Spa")

    response = await client.get("/api/v1/public/businesses")
    assert response.status_code == 200
    names = [b["name"] for b in response.json()["items"]]
    assert names == sorted(names)


@pytest.mark.asyncio
async def test_list_public_businesses_hides_owner_id(
    client: AsyncClient, db: AsyncSession, test_user: User
) -> None:
    await _make_business(db, test_user, "Private Inc.")

    response = await client.get("/api/v1/public/businesses")
    assert response.status_code == 200
    item = response.json()["items"][0]
    assert "owner_id" not in item


@pytest.mark.asyncio
async def test_list_public_businesses_empty_when_no_results(
    client: AsyncClient,
) -> None:
    response = await client.get("/api/v1/public/businesses?q=doesnotexist")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 0
    assert body["items"] == []
