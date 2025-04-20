from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from app.config import settings

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, echo=False) # Set echo=True for SQL logs

# Create async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
Base = declarative_base()

async def get_db() -> AsyncSession:
    """Dependency function to get an async database session."""
    async with AsyncSessionLocal() as session:
        yield session 