"""SQLModel definitions for Shopping Cart and Cart Items.

Defines the database models for shopping carts and the items within them,
including relationships to users and games.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID  # Import UUID type

from sqlmodel import Field, Relationship, SQLModel

# Import User and Game for type hinting
from .model_user import UserItem

# from .game import Game # This import might be causing issues if Game isn't defined yet or circular dependency

# Remove custom ID utility import
# from app.core.utils import generate_custom_id

if TYPE_CHECKING:
    # Use TYPE_CHECKING block for models involved in circular relationships
    # from .model_game import GameItem # Remove incorrect import
    from .model_game import Game  # Add correct import
    from .model_user import UserItem


# CartItem inherits directly from SQLModel, not InDBBase, as its primary key is not its own ID
# but rather the combination of cart_id and product_id (or it could have its own UUID)
# Let's give it its own UUID for easier referencing, similar to Item model
class CartEntryItem(SQLModel, table=True):
    """Represents an item entry within a shopping cart in the database.

    Links a specific game to a shopping cart with a defined quantity.

    Attributes:
        id: The unique identifier for this specific cart entry.
        quantity: The number of units of the game in the cart.
        cart_id: Foreign key linking to the ShoppingCartItem (carts table).
        game_id: Foreign key linking to the GameItem (games table).
        cart: Relationship back to the parent ShoppingCartItem.
        game: Relationship to the associated GameItem.
    """

    __tablename__ = "cart_entries"

    id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    quantity: int = Field(default=1, nullable=False)

    # Foreign keys
    cart_id: UUID = Field(foreign_key="shopping_carts.id", nullable=False, index=True)
    game_id: UUID = Field(foreign_key="games.id", nullable=False, index=True)

    # Relationships
    cart: "ShoppingCartItem" = Relationship(back_populates="items")
    game: "Game" = Relationship(back_populates="cart_items")


# Cart model inherits from InDBBase to get id and owner_id
class ShoppingCartItem(SQLModel, table=True):
    """Represents a user's shopping cart in the database.

    Each cart is uniquely associated with a user and holds multiple cart items.

    Attributes:
        id: The unique identifier for the shopping cart.
        user_id: Foreign key linking to the UserItem (app_users table).
                 Marked as unique to enforce one cart per user.
        items: A list of CartEntryItem objects associated with this cart.
               Configured to cascade deletes.
        user: Relationship back to the UserItem who owns the cart.
    """

    __tablename__ = "shopping_carts"

    id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    # Link to our app_users table
    user_id: UUID = Field(foreign_key="app_users.id", unique=True, index=True)

    # Relationships
    items: list["CartEntryItem"] = Relationship(
        back_populates="cart", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    user: "UserItem" = Relationship(back_populates="cart")
