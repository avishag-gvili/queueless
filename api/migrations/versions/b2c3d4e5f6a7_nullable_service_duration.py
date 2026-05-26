"""nullable service duration

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-17 10:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("services", "duration_minutes", nullable=True)


def downgrade() -> None:
    # Restore NOT NULL — fill any nulls with 30 first to avoid constraint violation
    op.execute("UPDATE services SET duration_minutes = 30 WHERE duration_minutes IS NULL")
    op.alter_column("services", "duration_minutes", nullable=False)
