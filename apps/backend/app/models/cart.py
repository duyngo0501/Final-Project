import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    # Avoid circular imports for type hinting
    pass  # Assuming product model is separate
    # from app.models.product import Product # Assuming product model is separate


# CartItem inherits directly from SQLModel, not InDBBase, as its primary key is not its own ID
# but rather the combination of cart_id and product_id (or it could have its own UUID)
# Let's give it its own UUID for easier referencing, similar to Item model
class CartItem(SQLModel, table=True):
    """Represents an item within a shopping cart in the database."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    quantity: int = Field(default=1, nullable=False)

    # Foreign keys
    cart_id: uuid.UUID = Field(foreign_key="cart.id", nullable=False, index=True)
    product_id: uuid.UUID = Field(
        # Assuming a product table exists with primary key 'id'
        # foreign_key="product.id", # Uncomment and adjust if Product model exists
        nullable=False,
        index=True,
    )

    # Relationships
    cart: "Cart" = Relationship(back_populates="items")
    # product: "Product" = Relationship() # Uncomment if Product model exists


# Cart model inherits from InDBBase to get id and owner_id
class Cart(SQLModel, table=True):
    """Represents a shopping cart associated with a user."""
    # Inherits id (PK) and owner_id (FK to auth.users) from InDBBase in DB
    # But we need to define them here for SQLModel
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # owner_id: uuid.UUID = Field(
    #     foreign_key="auth.users.id", nullable=False, index=True, unique=True
    # ) # Assuming one cart per user

    # Add field to store Supabase user ID directly
    owner_supabase_id: uuid.UUID = Field(index=True, nullable=False, unique=True) # Assuming one cart per user

    # Relationships
    items: list["CartItem"] = Relationship(back_populates="cart", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    # owner: "User" = Relationship() # Define relationship to User if needed elsewhere 
