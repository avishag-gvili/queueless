from datetime import datetime

from pydantic import BaseModel


class SlotRead(BaseModel):
    """A single available appointment start time (UTC)."""

    starts_at: datetime
    ends_at: datetime
