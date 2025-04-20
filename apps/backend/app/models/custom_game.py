import uuid
from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel
from pydantic import HttpUrl
from sqlalchemy import String # Import String type
# from sqlalchemy.sql.sqltypes import AutoString # Incorrect import

# Use SQLModel directly as we don't need InDBBase fields like owner_id
class CustomGame(SQLModel, table=True):
    """Database model for custom games added by admins."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True, max_length=255)
    slug: str = Field(unique=True, index=True, max_length=255) # Auto-generate from name?
    description: Optional[str] = Field(default=None)
    released: Optional[date] = Field(default=None)
    # Explicitly map HttpUrl to a database String type
    background_image: Optional[HttpUrl] = Field(default=None, sa_type=String)
    # Add any other relevant fields you want admins to manage
    # created_by_admin_id: uuid.UUID = Field(index=True) # Optional: Track which admin added it 