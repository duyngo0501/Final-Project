"""SQLModel definition for Application Users."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional, List

from sqlmodel import Field, Relationship, SQLModel

# Import the new utility function
from app.core.utils import generate_custom_id

# Conditional imports for type hinting to avoid circular dependency issues
if TYPE_CHECKING:
    from .cart import ShoppingCartItem
    from .order import Order


class UserBase(SQLModel):
    """
    Base SQLModel for user data.

    Attributes:
        email (str): The user's email address, must be unique.
        is_active (bool): Whether the user account is active. Defaults to True.
        is_superuser (bool): Whether the user has superuser privileges. Defaults to False.
    """

    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False


class UserItem(SQLModel, table=True):
    """
    Represents an application user in the database.

    This model stores user information specific to the application,
    potentially linked to a Supabase Auth user via the UUID `id` field.

    Attributes:
        id: Primary key, expected to match the Supabase Auth user ID (UUID).
        email: User's unique email address.
        hashed_password: User's securely hashed password.
        full_name: Optional full name of the user.
        avatar_url: Optional URL to the user's avatar image.
        is_active: Flag indicating if the user account is active.
        is_superuser: Flag indicating if the user has superuser privileges.
        is_admin: Flag indicating if the user has administrative privileges.
        created_at: Timestamp when the user record was created.
        updated_at: Timestamp when the user record was last updated.
        orders: Relationship to the list of Order instances placed by this user.
        cart: Relationship to the user's single ShoppingCartItem (one-to-one).
    """

    __tablename__ = "app_users"  # Keep original table name

    # Use generate_custom_id with prefix 'us'
    id: str = Field(
        default_factory=lambda: generate_custom_id(prefix="us"),
        primary_key=True,
        index=True,
        nullable=False,
    )
    email: str = Field(unique=True, index=True, max_length=255, nullable=False)
    hashed_password: str
    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None)  # Store URL as string
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)
    is_admin: bool = Field(default=False, nullable=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
    )

    # Relationships
    # One-to-many: User can have many Orders
    # Ensure Order model has back_populates="user"
    orders: List["Order"] = Relationship(back_populates="user")

    # One-to-one: User has one Cart
    # Ensure ShoppingCartItem model has back_populates="user"
    cart: Optional["ShoppingCartItem"] = Relationship(back_populates="user")

    # Add other relationships as needed, e.g., reviews, wishlists
