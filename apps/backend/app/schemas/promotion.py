import enum
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, validator


# Use the same Enum as in the model
class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class PromotionBase(BaseModel):
    """Shared base properties for a promotion."""

    code: str = Field(
        ..., max_length=100, description="Unique promotion code (e.g., SUMMER20)"
    )
    description: str | None = Field(
        None, max_length=255, description="Description of the promotion"
    )
    discount_type: DiscountType = Field(
        default=DiscountType.PERCENTAGE, description="Type of discount"
    )
    discount_value: float = Field(
        ..., gt=0, description="Value of the discount (percentage or fixed amount)"
    )
    start_date: date | None = Field(
        None, description="When the promotion becomes active"
    )
    end_date: date | None = Field(None, description="When the promotion expires")
    is_active: bool = Field(
        True, description="Whether the promotion is currently active"
    )

    @validator("end_date")
    def end_date_must_be_after_start_date(
        cls, end_date: date, values: dict[str, Any]
    ) -> date:
        start_date = values.get("start_date")
        if start_date and end_date < start_date:
            raise ValueError("End date must be on or after start date")
        return end_date


class PromotionCreate(PromotionBase):
    """Properties to receive via API on creation."""

    pass  # Inherits all from Base


class PromotionUpdate(PromotionBase):
    """Properties to receive via API on update (all optional)."""

    code: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=255)
    discount_type: DiscountType | None = None
    discount_value: float | None = Field(None, gt=0)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None

    @validator("end_date")
    def end_date_must_be_after_start_date_optional(
        cls, end_date: date, values: dict[str, Any]
    ) -> date:
        start_date = values.get("start_date")
        if start_date is not None and end_date is not None and end_date < start_date:
            raise ValueError("End date must be on or after start date")
        return end_date


class Promotion(PromotionBase):
    """Properties to return via API."""

    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows creating from ORM models


class PromotionResponse(PromotionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable reading data from ORM models
