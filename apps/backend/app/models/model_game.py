"""SQLModel definition for Games stored locally, supporting both RAWG-sourced and custom games."""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional, List
from uuid import UUID

from sqlmodel import JSON, Column, Field, Relationship, SQLModel

# Import the utility for custom ID generation if needed for relationships,
# but the primary ID will come from RAWG.
# from app.core.utils import generate_custom_id

# Import the Link model directly for relationship definition
from .model_promotion import GamePromotionLink

# Conditional imports if relationships are added later
if TYPE_CHECKING:
    from .model_user import UserItem  # For admin creator relationship
    from .model_promotion import (
        PromotionItem,
    )  # Keep PromotionItem here for type hinting
    from .model_cart import CartEntryItem  # Add CartEntryItem import
    from .model_order import OrderItem  # Add OrderItem import


class GameBase(SQLModel):
    """Base properties for a Game, supporting both RAWG and custom games."""

    # Fields common to both or primarily from RAWG
    # Made rawg_id optional for custom games
    rawg_id: Optional[int] = Field(
        default=None,
        unique=True,
        index=True,
        description="ID from the RAWG.io API (null for custom games)",
    )
    # Assuming slug should be mandatory and unique for both types
    slug: str = Field(index=True, unique=True, nullable=False)
    name: str = Field(index=True, nullable=False)
    released_date: Optional[date] = Field(
        default=None, alias="released"  # Keep alias for potential RAWG seeding
    )
    # Use str type for background_image for simplicity
    background_image: Optional[str] = Field(default=None)
    rating: Optional[float] = Field(default=None)
    rating_top: Optional[int] = Field(default=None)
    ratings_count: Optional[int] = Field(default=None)
    metacritic: Optional[int] = Field(default=None)
    playtime: Optional[int] = Field(default=None)
    suggestions_count: Optional[int] = Field(default=None)

    # Fields primarily from CustomGame, made optional
    description: Optional[str] = Field(default=None)


class Game(GameBase, table=True):
    """Represents a game entry, either seeded from RAWG or custom-added."""

    __tablename__ = "games"  # Explicit table name is good practice

    # Local primary key
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    # Flag to distinguish game types
    is_custom: bool = Field(default=False, index=True, nullable=False)

    # Link to the admin user who created the game (if custom)
    created_by_admin_id: Optional[UUID] = Field(
        default=None, foreign_key="app_users.id", index=True
    )

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
    )

    # --- Updated Back-Relationship to PromotionItem ----
    promotions: List["PromotionItem"] = Relationship(
        back_populates="games",
        link_model=GamePromotionLink,  # Use the imported class directly
    )
    # -----------------------------------------------

    # Potential Relationship to the creating admin User (if UserItem is updated)
    # admin_creator: Optional["UserItem"] = Relationship(back_populates="custom_games_added")

    # Add other relationships here if needed (e.g., OrderItem, CartItem)
    # order_items: List["OrderItem"] = Relationship(back_populates="game")
    order_items: List["OrderItem"] = Relationship(back_populates="game")
    cart_items: List["CartEntryItem"] = Relationship(
        back_populates="game"
    )  # Add relationship
