"""Base SQLModel class for database models.

Provides a common base for models that represent database tables.
"""

from sqlmodel import SQLModel

# NOTE: If using Alembic, SQLModel classes should inherit from SQLModel directly
# or a custom base that doesn't conflict with Alembic's declarative base.

# Base = declarative_base() # REMOVED - Potentially conflicts with SQLModel/Alembic


class InDBBase(SQLModel):
    """Base class for database-backed models.

    Intended to potentially hold common fields like primary keys,
    foreign keys (e.g., owner_id), or timestamps.
    Currently serves as a simple base inheriting from SQLModel.

    Example common fields (commented out):
        id: uuid.UUID | None = Field(default=None, primary_key=True)
        owner_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")
        created_at: datetime | None = Field(default_factory=datetime.utcnow)
        updated_at: datetime | None = Field(
            default_factory=datetime.utcnow,
            sa_column_kwargs={"onupdate": datetime.utcnow}
        )
    """

    # Common fields can be added here later as needed.
    # For now, specific models define their own fields directly.
    pass
