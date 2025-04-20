"""SQLModel definitions for Games and their relationship with Promotions."""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from pydantic import HttpUrl
from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

# Import the new utility function
from app.core.utils import generate_custom_id

# Conditional imports for type hinting
if TYPE_CHECKING:
    from .cart import CartEntryItem
    from .order import OrderItem
    from .promotion import PromotionItem


# Define a link model for ManyToMany relationship between Game and Promotion
class GamePromotionLink(SQLModel, table=True):
    """Association table for the many-to-many relationship between games and promotions.

    Attributes:
        game_id: Foreign key referencing the GameItem's ID.
        promotion_id: Foreign key referencing the PromotionItem's ID.
    """

    __tablename__ = "game_promotion_link"  # Explicit table name

    game_id: str | None = Field(default=None, foreign_key="games.id", primary_key=True)
    promotion_id: str | None = Field(
        default=None, foreign_key="promotions.id", primary_key=True
    )


class GameItem(SQLModel, table=True):
    """Represents a game product in the database.

    Stores core details about a game, including metadata, pricing,
    and relationships to orders, carts, and promotions.

    Attributes:
        id: Unique identifier for the game.
        name: Name of the game.
        slug: Unique, URL-friendly identifier for the game.
        description: Optional text description of the game.
        price: Price of the game. Consider using Decimal for financial precision.
        release_date: Optional date when the game was released.
        developer: Optional name of the game's developer.
        publisher: Optional name of the game's publisher.
        image_url: Optional URL for the game's cover image or main image.
        platforms: List of platforms the game is available on (stored as String).
                   Consider a separate Platform model for normalization.
        genres: List of genres associated with the game (stored as String).
                Consider a separate Genre model for normalization.
        created_at: Timestamp when the game record was created.
        updated_at: Timestamp when the game record was last updated.
        order_items: Relationship to OrderItem instances associated with this game.
        cart_items: Relationship to CartEntryItem instances where this game is present.
        promotions: Relationship to PromotionItem instances applicable to this game
                    (via GamePromotionLink).
    """

    __tablename__ = "games"

    id: str = Field(
        default_factory=lambda: generate_custom_id(prefix="ga"),
        primary_key=True,
        index=True,
        nullable=False,
    )
    name: str = Field(index=True, max_length=255, nullable=False)
    slug: str = Field(unique=True, index=True, max_length=255, nullable=False)
    description: str | None = Field(default=None)
    price: float = Field(default=0.0, nullable=False)  # Ensure price is non-nullable
    release_date: date | None = Field(default=None)
    developer: str | None = Field(default=None, max_length=255)
    publisher: str | None = Field(default=None, max_length=255)
    image_url: HttpUrl | None = Field(default=None, sa_column=Column(String))

    # Storing lists as simple strings is not ideal for querying/filtering.
    # Consider using JSON type if supported or preferably related tables (Platform, Genre).
    platforms: list[str] | None = Field(
        default=None, sa_column=Column(String)  # Or JSON
    )
    genres: list[str] | None = Field(default=None, sa_column=Column(String))  # Or JSON

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
    )

    # Relationships
    # Ensure corresponding models have the back_populates defined
    order_items: list["OrderItem"] = Relationship(back_populates="game")
    cart_items: list["CartEntryItem"] = Relationship(back_populates="game")
    promotions: list["PromotionItem"] = Relationship(
        back_populates="games", link_model=GamePromotionLink
    )
