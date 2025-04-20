# Placeholder for Order schemas
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class OrderItemCreateSchema(BaseModel):
    game_id: int
    quantity: int
    price_at_purchase: float


class OrderCreateSchema(BaseModel):
    customer_email: EmailStr
    customer_phone: str | None = None
    items: list[OrderItemCreateSchema] = Field(default_factory=list)


class OrderItemResponseSchema(BaseModel):
    id: int
    game_id: int
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True


class OrderResponseSchema(BaseModel):
    id: int
    customer_email: EmailStr
    customer_phone: str | None
    total_amount: float
    status: str
    order_date: datetime
    items: list[OrderItemResponseSchema]

    class Config:
        from_attributes = True
