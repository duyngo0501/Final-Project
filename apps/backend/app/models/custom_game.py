"""SQLModel definition for Custom Games.

Defines the database model for games manually added by administrators.
"""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from pydantic import HttpUrl
from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

# Import the new utility function
from app.core.utils import generate_custom_id

# Conditional import for type hinting
if TYPE_CHECKING:
    from .user import UserItem  # Assuming UserItem is the model in user.py


class CustomGame(SQLModel, table=True):
    """Represents a custom game entry manually added by an admin.

    Stores details about games that are not sourced from external APIs like RAWG.

    Attributes:
        id: Unique identifier for the custom game entry.
        name: The name of the custom game.
        slug: A unique, URL-friendly identifier derived from the name.
        description: Optional text description of the game.
        released: Optional release date of the game.
        background_image: Optional URL for the game's background image.
        created_by_admin_id: Optional foreign key linking to the admin user
                             who created this entry (app_users table).
        created_at: Timestamp when the entry was created.
        updated_at: Timestamp when the entry was last updated.
        admin_creator: Optional relationship to the UserItem who created the game.
    """

    __tablename__ = "custom_games"  # Explicit table name

    id: str = Field(
        default_factory=lambda: generate_custom_id(prefix="cg"),
        primary_key=True,
        index=True,
        nullable=False,
    )
    name: str = Field(index=True, max_length=255, nullable=False)
    # Ensure slug is non-nullable if it's always required
    slug: str = Field(unique=True, index=True, max_length=255, nullable=False)
    description: str | None = Field(default=None)
    released: date | None = Field(default=None)
    # Map Pydantic HttpUrl to a database String. Use Optional[] for nullability.
    background_image: HttpUrl | None = Field(default=None, sa_column=Column(String))

    # Link to the admin user who created the game
    created_by_admin_id: str | None = Field(
        default=None, foreign_key="app_users.id", index=True
    )

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
    )

    # Relationship to the creating admin User
    # Ensure UserItem model has the corresponding 'custom_games_added' relationship
    # Commenting out due to missing 'custom_games_added' on UserItem
    # admin_creator: Optional["UserItem"] = Relationship(
    #     back_populates="custom_games_added"
    # )
