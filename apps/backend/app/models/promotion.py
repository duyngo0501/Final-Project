import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Promotion(SQLModel, table=True):
    """Database model for promotions."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    code: str = Field(max_length=100, unique=True, index=True, nullable=False)
    description: Optional[str] = Field(default=None, max_length=255)
    discount_percentage: float = Field(nullable=False)
    start_date: Optional[datetime] = Field(default=None, index=True)
    end_date: Optional[datetime] = Field(default=None, index=True)
    is_active: bool = Field(default=True, nullable=False, index=True)

    # Automatic timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow}
    ) 