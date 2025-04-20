"""Change all PK/FK IDs to STR and add app_users table

Revision ID: 9bcf745fbcf7
Revises: 
Create Date: 2025-04-20 23:34:34.548016

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '9bcf745fbcf7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
