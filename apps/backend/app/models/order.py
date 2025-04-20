"""SQLModel definitions for Orders and Order Items."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

# Import the new utility function
from app.core.utils import generate_custom_id

# Conditional imports for type hinting
if TYPE_CHECKING:
    from .game import GameItem
    from .user import UserItem


class Order(SQLModel, table=True):
    """Represents a customer order in the database.

    Stores overall order information, customer details, status, and links
    to the user (if logged in) and individual order items.

    Attributes:
        id: Unique identifier for the order.
        user_id: Optional foreign key linking to the UserItem (app_users table)
                 if the order was placed by a logged-in user.
        customer_email: The email address provided by the customer for the order.
        customer_phone: Optional phone number provided by the customer.
        total_amount: The total monetary value of the order.
        status: The current status of the order (e.g., 'processing', 'completed',
                'cancelled'). Consider using an Enum for predefined statuses.
        order_date: Timestamp when the order was placed.
        created_at: Timestamp when the order record was created.
        updated_at: Timestamp when the order record was last updated.
        items: Relationship to the list of OrderItem instances belonging to this order.
               Configured to cascade deletes.
        user: Optional relationship to the UserItem who placed the order.
    """

    __tablename__ = "orders"

    id: str = Field(
        default_factory=lambda: generate_custom_id(prefix="or"),
        primary_key=True,
        index=True,
        nullable=False,
    )
    # Link to the user who placed the order, if they were logged in.
    user_id: str | None = Field(default=None, foreign_key="app_users.id", index=True)
    customer_email: str = Field(nullable=False, index=True)
    customer_phone: str | None = Field(default=None)
    total_amount: float = Field(nullable=False)
    # Consider using an Enum for status values
    status: str = Field(default="processing", index=True, nullable=False)
    order_date: datetime = Field(nullable=False)

    # Timestamps for record management
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
    )

    # Relationships
    # One-to-many: An Order has many OrderItems
    order_items: List["OrderItem"] = Relationship(back_populates="order")
    # Many-to-one: An Order belongs to one User (optional)
    user: Optional["UserItem"] = Relationship(
        back_populates="orders"  # Assumes UserItem has 'orders' relationship
    )


class OrderItem(SQLModel, table=True):
    """Represents a single item line within an order.

    Links an order to a specific game and records the quantity and price
    at the time the order was placed.

    Attributes:
        id: Unique identifier for the order item line.
        order_id: Foreign key linking to the parent Order (orders table).
        game_id: Foreign key linking to the GameItem (games table).
        quantity: The number of units of the game ordered.
        price_at_purchase: The price of a single unit of the game at the time
                           the order was placed. Consider using Decimal.
        order: Relationship back to the parent Order.
        game: Relationship to the GameItem purchased.
    """

    __tablename__ = "order_items"

    id: str = Field(
        default_factory=lambda: generate_custom_id(prefix="oi"),
        primary_key=True,
        index=True,
        nullable=False,
    )
    order_id: str = Field(foreign_key="orders.id", nullable=False, index=True)
    game_id: str = Field(foreign_key="games.id", nullable=False, index=True)
    quantity: int = Field(nullable=False)
    price_at_purchase: float = Field(nullable=False)  # Consider Decimal for currency

    # Relationships
    order: Optional["Order"] = Relationship(back_populates="order_items")
    game: Optional["GameItem"] = Relationship(back_populates="order_items")
