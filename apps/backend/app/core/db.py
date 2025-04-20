"""Database connection setup and session management.

Configures the SQLAlchemy engine and provides a dependency for database sessions.
"""

from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# NOTE: Models should be imported elsewhere (e.g., in alembic env.py or crud operations)
# to ensure SQLModel registers them before any operations.
# from app.models import User # Example - Removed as User model might be elsewhere

# Create the database engine using the URI from settings.
# pool_pre_ping=True enables connection health checks.
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), pool_pre_ping=True)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a SQLAlchemy session.

    Creates a new SQLModel session for each request and ensures it's closed.

    Yields:
        Session: The database session for the request context.
    """
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Initializes the database (placeholder).

    Note: Database table creation and data seeding should ideally be handled
          by Alembic migrations rather than this function.

    If not using Alembic, specific table creation logic (e.g.,
    `SQLModel.metadata.create_all(engine)`) or initial data seeding
    could be placed here.
    """
    # Currently does nothing, assuming Alembic handles initialization.
    print("Database initialization function `init_db` called (no-op by default).")
    pass
