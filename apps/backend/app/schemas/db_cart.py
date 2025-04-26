"""Pydantic schemas for Shopping Cart and Cart Items.

Defines the data structures for cart-related API requests and responses,
including validation rules.
"""

import uuid

from pydantic import BaseModel, Field

# --- Cart Item Schemas ---


class CartItemBaseSchema(BaseModel):
    """Base schema for cart item properties.

    Contains fields shared across creation and response schemas.

    Attributes:
        product_id: The unique identifier (UUID) of the game product.
        quantity: The number of units of the product (must be greater than 0).
    """

    product_id: uuid.UUID = Field(
        ..., description="The UUID of the product (game) in the cart"
    )
    quantity: int = Field(
        ..., gt=0, description="Number of units of the product (must be positive)"
    )


class CartItemCreateSchema(CartItemBaseSchema):
    """Schema for data needed when adding a new item to the cart.

    Inherits `product_id` and `quantity` from the base schema.
    """

    pass  # No additional fields needed beyond the base for creation


class CartItemUpdateSchema(BaseModel):
    """Schema for data needed when updating the quantity of an existing cart item.

    Attributes:
        quantity: The new quantity for the item (must be greater than 0).
    """

    quantity: int = Field(
        ..., gt=0, description="New quantity for the item (must be positive)"
    )


class CartItemResponseSchema(CartItemBaseSchema):
    """Schema for representing a cart item in API responses.

    Includes the unique ID of the cart item entry itself, in addition
    to base properties.

    Attributes:
        id: The unique identifier (UUID) of this specific cart entry.
        cart_id: The unique identifier (UUID) of the cart this item belongs to.
        product_id: (Inherited) The UUID of the game product.
        quantity: (Inherited) The number of units.
    """

    id: uuid.UUID  # ID of the CartEntryItem record
    cart_id: uuid.UUID

    class Config:
        from_attributes = True  # Enable creating schema from ORM objects


# --- Cart Schemas ---


class CartBaseSchema(BaseModel):
    """Base schema for cart properties (currently empty).

    A cart's identity is primarily defined by its owner and items.
    """

    pass


class CartCreateSchema(CartBaseSchema):
    """Schema for creating a cart (usually implicit, placeholder).

    Cart creation is often handled automatically when a user adds their first item.
    """

    pass


class CartUpdateSchema(CartBaseSchema):
    """Schema for updating cart properties (placeholder).

    Direct updates to the cart object itself are typically not exposed via API.
    Updates usually happen via adding/removing/updating items.
    """

    pass


class CartResponseSchema(CartBaseSchema):
    """Schema for representing a shopping cart in API responses.

    Includes the cart's ID, owner's ID, and a list of its items.

    Attributes:
        id: The unique identifier (UUID) of the shopping cart.
        owner_id: The unique identifier (UUID) of the user who owns the cart.
        items: A list of CartItemResponseSchema objects representing the items
               currently in the cart.
    """

    id: uuid.UUID
    owner_id: uuid.UUID
    items: list[CartItemResponseSchema] = []  # Default to empty list

    class Config:
        from_attributes = True  # Allows creating from ORM models
