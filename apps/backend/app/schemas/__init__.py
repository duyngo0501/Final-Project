"""Pydantic Schemas Package.

Imports and re-exports schemas from modules within this directory
for easier access throughout the application.
"""

from .auth import TokenSchema, UserCreateSchema, UserResponseSchema, UserUpdateSchema
from .cart import (
    CartBaseSchema,
    CartCreateSchema,
    CartItemBaseSchema,
    CartItemCreateSchema,
    CartItemResponseSchema,
    CartItemUpdateSchema,
    CartResponseSchema,
    CartUpdateSchema,
)
from .order import (
    OrderCreateSchema,
    OrderItemCreateSchema,
    OrderItemResponseSchema,
    OrderResponseSchema,
)

# Add other schema imports as needed, e.g., from .product import Product, ProductListingResponse

__all__ = [
    # Auth Schemas
    "TokenSchema",
    "UserCreateSchema",
    "UserUpdateSchema",
    "UserResponseSchema",
    # Cart Schemas
    "CartItemBaseSchema",
    "CartItemCreateSchema",
    "CartItemUpdateSchema",
    "CartItemResponseSchema",
    "CartBaseSchema",
    "CartCreateSchema",
    "CartUpdateSchema",
    "CartResponseSchema",
    # Order Schemas
    "OrderItemCreateSchema",
    "OrderCreateSchema",
    "OrderItemResponseSchema",
    "OrderResponseSchema",
    # Product Schemas (if needed publicly)
    # "Product",
    # "ProductListingResponse",
]
