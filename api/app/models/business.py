import enum
from datetime import datetime, UTC
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BusinessCategory(str, enum.Enum):
    BARBERSHOP_MEN = "barbershop_men"
    HAIR_SALON_WOMEN = "hair_salon_women"
    NAIL_SALON = "nail_salon"
    EYEBROWS = "eyebrows"
    MAKEUP = "makeup"
    COSMETICIAN = "cosmetician"
    SPA = "spa"
    MASSAGE = "massage"
    TATTOO = "tattoo"
    PIERCING = "piercing"
    LASER_HAIR_REMOVAL = "laser_hair_removal"
    DOCTOR = "doctor"
    DENTIST = "dentist"
    PHYSIOTHERAPY = "physiotherapy"
    PSYCHOLOGIST = "psychologist"
    NUTRITIONIST = "nutritionist"
    ALTERNATIVE_MEDICINE = "alternative_medicine"
    VETERINARY = "veterinary"
    PET_GROOMING = "pet_grooming"
    YOGA = "yoga"
    PILATES = "pilates"
    PERSONAL_TRAINING = "personal_training"
    DANCE_STUDIO = "dance_studio"
    MUSIC_LESSONS = "music_lessons"
    TUTORING = "tutoring"
    DRIVING_SCHOOL = "driving_school"
    PHOTOGRAPHY = "photography"
    EVENT_PLANNING = "event_planning"
    CAR_WASH = "car_wash"
    CAR_REPAIR = "car_repair"
    CLEANING_SERVICE = "cleaning_service"
    OTHER = "other"


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Jerusalem")
    # 0 = anonymize immediately on completion; >0 = wait N days
    customer_data_retention_days: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[BusinessCategory] = mapped_column(
        Enum(BusinessCategory, name="businesscategory", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=BusinessCategory.OTHER,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    owner: Mapped["User"] = relationship(back_populates="businesses")  # type: ignore[name-defined]  # noqa: F821
    services: Mapped[list["Service"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="business",
        cascade="all, delete-orphan",
    )
    working_hours: Mapped[list["WorkingHours"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="business",
        cascade="all, delete-orphan",
    )
