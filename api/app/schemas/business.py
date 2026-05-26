from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.business import BusinessCategory


class BusinessCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    city: str | None = Field(default=None, max_length=100)
    category: BusinessCategory = BusinessCategory.OTHER
    customer_data_retention_days: int = Field(default=0, ge=0)


class BusinessUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    city: str | None = Field(default=None, max_length=100)
    category: BusinessCategory | None = None
    customer_data_retention_days: int | None = Field(default=None, ge=0)


class BusinessRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    name: str
    description: str | None
    city: str | None
    timezone: str
    category: BusinessCategory
    customer_data_retention_days: int
    created_at: datetime
    updated_at: datetime


class BusinessPublicRead(BaseModel):
    """Subset of Business safe to expose without authentication."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    city: str | None
    category: BusinessCategory
