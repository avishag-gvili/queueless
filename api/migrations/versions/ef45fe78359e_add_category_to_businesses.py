"""add category to businesses

Revision ID: ef45fe78359e
Revises: 2b3c4d5e6f7a
Create Date: 2026-05-14 18:58:07.950069

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef45fe78359e'
down_revision: Union[str, None] = '2b3c4d5e6f7a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    category_enum = sa.Enum(
        'barbershop', 'beauty', 'nails', 'health', 'massage', 'fitness', 'veterinary', 'other',
        name='businesscategory',
    )
    category_enum.create(op.get_bind(), checkfirst=True)
    op.add_column('businesses', sa.Column('category', category_enum, nullable=True))
    op.execute("UPDATE businesses SET category = 'other' WHERE category IS NULL")
    op.alter_column('businesses', 'category', nullable=False)


def downgrade() -> None:
    op.drop_column('businesses', 'category')
    sa.Enum(name='businesscategory').drop(op.get_bind(), checkfirst=True)
