from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    service_id: UUID
    starts_at: datetime  # must be UTC-aware; validated in the booking service
    customer_name: str = Field(min_length=1, max_length=200)
    customer_email: EmailStr
    customer_phone: str | None = Field(default=None, max_length=20)
    notes: str | None = Field(default=None, max_length=1000)


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    service_id: UUID
    customer_id: UUID | None
    customer_name: str
    customer_email: str
    customer_phone: str | None
    starts_at: datetime
    ends_at: datetime
    status: AppointmentStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime
    anonymized_at: datetime | None
    # Denormalised — read from loaded ORM relationships when available
    service_name: str | None = None
    business_name: str | None = None
    service_duration_minutes: int | None = None  # None = open duration

    @classmethod
    def model_validate(  # type: ignore[override]
        cls,
        obj: object,
        *,
        strict: bool | None = None,
        from_attributes: bool | None = None,
        context: dict | None = None,
    ) -> "AppointmentRead":
        instance = super().model_validate(
            obj, strict=strict, from_attributes=from_attributes, context=context
        )
        # Populate denormalised fields from ORM relationships if loaded
        try:
            svc = getattr(obj, "service", None)
            if svc is not None:
                instance.service_name = svc.name
                instance.service_duration_minutes = svc.duration_minutes
                biz = getattr(svc, "business", None)
                if biz is not None:
                    instance.business_name = biz.name
        except Exception:
            pass
        return instance
