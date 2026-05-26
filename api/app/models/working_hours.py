from datetime import time
from uuid import UUID, uuid4

from sqlalchemy import Integer, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkingHours(Base):
    """A single open window for a business on a given day of the week.

    Multiple rows per day are allowed (for split shifts).
    day_of_week uses Sun=0 .. Sat=6 (NOT Python's Mon=0 default).
    """

    __tablename__ = "working_hours"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    business_id: Mapped[UUID] = mapped_column(ForeignKey("businesses.id", ondelete="CASCADE"))
    # Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    day_of_week: Mapped[int] = mapped_column(Integer)
    open_time: Mapped[time] = mapped_column(Time)
    close_time: Mapped[time] = mapped_column(Time)

    business: Mapped["Business"] = relationship(back_populates="working_hours")  # type: ignore[name-defined]  # noqa: F821
