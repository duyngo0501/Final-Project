"""Pydantic schemas for the CustomGame model.

Defines data structures for creating and returning custom game data via the API.
"""

import uuid
from datetime import date

from pydantic import BaseModel, HttpUrl

# --- Schemas for CustomGame Model ---


class CustomGameBase(BaseModel):
    """Base schema for shared custom game properties.

    Attributes:
        name: The name of the custom game.
        description: Optional text description.
        released: Optional release date.
        background_image: Optional URL for the background image.
    """

    name: str
    description: str | None = None
    released: date | None = None
    background_image: HttpUrl | None = None


class CustomGameCreate(CustomGameBase):
    """Schema used for creating a new custom game via API.

    Inherits all fields from CustomGameBase.
    Currently requires `name` explicitly (though already required in Base).
    Can be used to enforce specific fields during creation.
    """

    # You might require certain fields during creation
    name: str  # Explicitly requires name (already in Base, but shows intent)


class CustomGamePublic(CustomGameBase):
    """Schema used for returning custom game data in API responses.

    Includes the database-generated ID and slug, in addition to base properties.

    Attributes:
        id: The unique identifier (UUID) of the custom game entry.
        slug: The unique, URL-friendly slug generated for the game.
        name: (Inherited) Name of the game.
        description: (Inherited) Optional description.
        released: (Inherited) Optional release date.
        background_image: (Inherited) Optional background image URL.
    """

    id: uuid.UUID  # Include the generated ID
    slug: str  # Include the generated slug

    class Config:
        from_attributes = True  # Enable ORM mode


# Maybe a schema for listing multiple custom games
class CustomGameList(BaseModel):
    """Schema for returning a list of custom games, e.g., in an admin panel.

    Attributes:
        data: A list of CustomGamePublic objects.
        count: The total number of custom games available (for pagination).
    """

    data: list[CustomGamePublic]
    count: int
