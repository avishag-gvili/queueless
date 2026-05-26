from datetime import time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class WorkingHoursCreate(BaseModel):
    # Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    day_of_week: int = Field(ge=0, le=6)
    open_time: time
    close_time: time

    @model_validator(mode="after")
    def open_before_close(self) -> "WorkingHoursCreate":
        if self.open_time >= self.close_time:
            raise ValueError("open_time must be before close_time")
        return self


class WorkingHoursUpdate(BaseModel):
    open_time: time | None = None
    close_time: time | None = None

    @model_validator(mode="after")
    def open_before_close(self) -> "WorkingHoursUpdate":
        if self.open_time is not None and self.close_time is not None:
            if self.open_time >= self.close_time:
                raise ValueError("open_time must be before close_time")
        return self


class WorkingHoursRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    day_of_week: int
    open_time: time
    close_time: time
