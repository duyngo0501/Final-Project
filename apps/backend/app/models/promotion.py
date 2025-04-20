import enum
from datetime import datetime

# Use SQLModel imports
from sqlmodel import Enum as SQLModelEnum, Field

# Import the correct base class
from app.models.base import InDBBase


class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

# Inherit from InDBBase and use SQLModel syntax
class Promotion(InDBBase, table=True):
    __tablename__ = "promotions"

    # id is inherited from InDBBase
    code: str = Field(max_length=100, unique=True, index=True, nullable=False)
    description: str | None = Field(default=None, max_length=255)
    
    discount_type: DiscountType = Field(
        sa_column=SQLModelEnum(DiscountType, nullable=False),
        default=DiscountType.PERCENTAGE
    )
    discount_value: float = Field(nullable=False)
    
    start_date: datetime | None = Field(default=None)
    end_date: datetime | None = Field(default=None)
    
    is_active: bool = Field(default=True, nullable=False)
    
    # Optional: Add usage limits if needed
    # max_uses: int = Column(Integer, nullable=True)
    # current_uses: int = Column(Integer, default=0, nullable=False)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime | None = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # No __repr__ needed typically with SQLModel, Pydantic handles representation 
