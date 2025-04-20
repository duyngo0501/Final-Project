from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator

from .config import get_settings

settings = get_settings()

# Create the asynchronous engine
# Ensure the DATABASE_URL starts with the correct async driver prefix
# e.g., "postgresql+asyncpg://..." or "sqlite+aiosqlite:///..."
if settings.DATABASE_URL.startswith("sqlite"):
    # Use aiosqlite for SQLite
    async_db_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///", 1) \
                                       .replace("sqlite://", "sqlite+aiosqlite://", 1)
    connect_args = {"check_same_thread": False} # Specific to SQLite
else:
    # Assume PostgreSQL or similar needing asyncpg
    # Ensure the +asyncpg driver is specified
    if "+asyncpg" not in settings.DATABASE_URL:
        # Attempt to automatically add it if it looks like a standard postgres URL
        if settings.DATABASE_URL.startswith("postgresql://"):
            async_db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        else:
            # If the format is unexpected, raise an error or log a warning
            # For now, we'll assume it's correctly formatted if it's not standard postgres
            async_db_url = settings.DATABASE_URL
            print(f"Warning: DATABASE_URL '{settings.DATABASE_URL}' does not start with 'postgresql://'. Assuming async driver is correctly specified.")
    else:
        async_db_url = settings.DATABASE_URL
    connect_args = {}


engine = create_async_engine(
    async_db_url,
    echo=False,  # Set to True for debugging SQL queries
    future=True, # Use SQLAlchemy 2.0 style features
    connect_args=connect_args
)

# Create a configured "Session" class
AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False, # Recommended for FastAPI background tasks
    autoflush=False,
    autocommit=False
)

# Dependency to get a database session per request
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an AsyncSession.

    Yields:
        AsyncSession: An asynchronous database session.
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            # Optionally commit here if you want auto-commit behavior,
            # but it's generally better to commit explicitly in service layers.
            # await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            # The session is automatically closed by the context manager
            pass

# Base class for declarative models
Base = declarative_base()

# Optional: Function to create tables (useful for initial setup or testing without Alembic)
# async def create_tables():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

# Optional: Function to drop tables (useful for testing)
# async def drop_tables():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.drop_all) 