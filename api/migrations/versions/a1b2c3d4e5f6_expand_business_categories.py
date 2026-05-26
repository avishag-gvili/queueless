"""expand business categories

Revision ID: a1b2c3d4e5f6
Revises: ef45fe78359e
Create Date: 2026-05-17 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "ef45fe78359e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_CATEGORIES = [
    "barbershop_men",
    "hair_salon_women",
    "nail_salon",
    "eyebrows",
    "makeup",
    "cosmetician",
    "spa",
    "massage",
    "tattoo",
    "piercing",
    "laser_hair_removal",
    "doctor",
    "dentist",
    "physiotherapy",
    "psychologist",
    "nutritionist",
    "alternative_medicine",
    "veterinary",
    "pet_grooming",
    "yoga",
    "pilates",
    "personal_training",
    "dance_studio",
    "music_lessons",
    "tutoring",
    "driving_school",
    "photography",
    "event_planning",
    "car_wash",
    "car_repair",
    "cleaning_service",
    "other",
]

OLD_CATEGORIES = [
    "barbershop",
    "beauty",
    "nails",
    "health",
    "massage",
    "fitness",
    "veterinary",
    "other",
]


def upgrade() -> None:
    # PostgreSQL requires ALTER TYPE to add values; we rename the old enum,
    # create the new one, migrate data, then drop the old type.
    bind = op.get_bind()

    # Temporarily change column type to text so we can swap the enum
    op.alter_column("businesses", "category", type_=sa.Text(), postgresql_using="category::text")

    # Drop old enum type
    sa.Enum(name="businesscategory").drop(bind, checkfirst=True)

    # Create new enum type with all 32 values
    new_enum = sa.Enum(*NEW_CATEGORIES, name="businesscategory")
    new_enum.create(bind, checkfirst=True)

    # Migrate old values to new values
    op.execute("UPDATE businesses SET category = 'barbershop_men' WHERE category = 'barbershop'")
    op.execute("UPDATE businesses SET category = 'cosmetician' WHERE category = 'beauty'")
    op.execute("UPDATE businesses SET category = 'nail_salon' WHERE category = 'nails'")
    op.execute("UPDATE businesses SET category = 'doctor' WHERE category = 'health'")
    op.execute("UPDATE businesses SET category = 'personal_training' WHERE category = 'fitness'")
    # massage, veterinary, other stay as-is

    # Switch column back to the new enum type
    op.alter_column(
        "businesses",
        "category",
        type_=new_enum,
        postgresql_using="category::businesscategory",
        nullable=False,
    )


def downgrade() -> None:
    bind = op.get_bind()

    op.alter_column("businesses", "category", type_=sa.Text(), postgresql_using="category::text")

    sa.Enum(name="businesscategory").drop(bind, checkfirst=True)

    old_enum = sa.Enum(*OLD_CATEGORIES, name="businesscategory")
    old_enum.create(bind, checkfirst=True)

    # Reverse migrations (best effort)
    op.execute("UPDATE businesses SET category = 'barbershop' WHERE category = 'barbershop_men'")
    op.execute("UPDATE businesses SET category = 'beauty' WHERE category IN ('cosmetician', 'makeup', 'spa', 'eyebrows', 'piercing', 'tattoo', 'laser_hair_removal')")
    op.execute("UPDATE businesses SET category = 'nails' WHERE category = 'nail_salon'")
    op.execute("UPDATE businesses SET category = 'health' WHERE category IN ('doctor', 'dentist', 'physiotherapy', 'psychologist', 'nutritionist', 'alternative_medicine')")
    op.execute("UPDATE businesses SET category = 'fitness' WHERE category IN ('personal_training', 'yoga', 'pilates', 'dance_studio')")
    op.execute("UPDATE businesses SET category = 'other' WHERE category IN ('pet_grooming', 'music_lessons', 'tutoring', 'driving_school', 'photography', 'event_planning', 'car_wash', 'car_repair', 'cleaning_service', 'hair_salon_women')")

    op.alter_column(
        "businesses",
        "category",
        type_=old_enum,
        postgresql_using="category::businesscategory",
        nullable=False,
    )
