import uuid
from pydantic import BaseModel, Field

# --- Cart Item Schemas ---

class CartItemBase(BaseModel):
    """Shared base properties for a cart item."""
    product_id: uuid.UUID = Field(..., description="The UUID of the product in the cart")
    quantity: int = Field(..., gt=0, description="Number of units of the product")

class CartItemCreate(CartItemBase):
    """Properties to receive when adding an item to the cart."""
    pass

class CartItemUpdate(BaseModel):
    """Properties to receive when updating an item's quantity in the cart."""
    quantity: int = Field(..., gt=0, description="New quantity for the item")

class CartItem(CartItemBase):
    """Properties to return via API for a cart item."""
    id: uuid.UUID # Cart Item ID, not product ID
    cart_id: uuid.UUID

    class Config:
        from_attributes = True # Allows creating from ORM models

# --- Cart Schemas ---

class CartBase(BaseModel):
    """Shared base properties for a cart."""
    pass # Carts are mainly defined by their items and owner

class CartCreate(CartBase):
    """Properties to receive when creating a cart (usually implicit)."""
    pass

class CartUpdate(CartBase):
    """Properties to receive when updating a cart (not typically used directly)."""
    pass

class Cart(CartBase):
    """Properties to return via API representing the user's cart."""
    id: uuid.UUID
    owner_id: uuid.UUID
    items: list[CartItem] = [] # Include the list of items

    class Config:
        from_attributes = True # Allows creating from ORM models 