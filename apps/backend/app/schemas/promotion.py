import uuid
from datetime import datetime
from typing import Optional
import enum

from pydantic import BaseModel, Field, validator


# Use the same Enum as in the model
class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class PromotionBase(BaseModel):
    """Shared base properties for a promotion."""
    code: str = Field(..., max_length=100, description="Unique promotion code (e.g., SUMMER20)")
    description: Optional[str] = Field(None, max_length=255, description="Description of the promotion")
    discount_type: DiscountType = Field(default=DiscountType.PERCENTAGE, description="Type of discount")
    discount_value: float = Field(..., gt=0, description="Value of the discount (percentage or fixed amount)")
    start_date: Optional[datetime] = Field(None, description="When the promotion becomes active")
    end_date: Optional[datetime] = Field(None, description="When the promotion expires")
    is_active: bool = Field(True, description="Whether the promotion is currently active")

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        start_date = values.get('start_date')
        if start_date and v and v <= start_date:
            raise ValueError('End date must be after start date')
        return v


class PromotionCreate(PromotionBase):
    """Properties to receive via API on creation."""
    pass # Inherits all from Base


class PromotionUpdate(BaseModel):
    """Properties to receive via API on update (all optional)."""
    code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(None, gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

    @validator('end_date')
    def end_date_must_be_after_start_date_optional(cls, v, values):
        # Only validate if both dates are present in the update
        start_date = values.get('start_date')
        if start_date and v and v <= start_date:
            raise ValueError('End date must be after start date')
        # If only one is present, we can't validate relative order here easily
        # Database constraint or full object validation in CRUD might be better
        return v


class Promotion(PromotionBase):
    """Properties to return via API."""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # Allows creating from ORM models 


class PromotionResponse(PromotionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True # Enable reading data from ORM models 