"""Update ID default factories to use generate_custom_id

Revision ID: 4dd72b393f87
Revises: 9bcf745fbcf7
Create Date: 2025-04-20 23:41:47.905322

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '4dd72b393f87'
down_revision: Union[str, None] = '9bcf745fbcf7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
