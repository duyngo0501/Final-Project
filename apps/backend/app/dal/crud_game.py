"""CRUD operations for the unified Game model (RAWG and custom)."""

import uuid
from typing import Any, List, Optional

from slugify import slugify  # Import slugify
from sqlmodel import Session, select, func  # Import func for count

from app.models.model_game import Game

# We'll need a unified GameCreate schema eventually, assuming it exists for now
# from app.schemas.db_game import GameCreateSchema, GameUpdateSchema


class CRUDGame:
    """CRUD operations for the unified Game model (RAWG and custom)."""

    def get(self, db: Session, id: uuid.UUID) -> Game | None:
        """Retrieve a game by its local UUID."""
        return db.get(Game, id)

    def get_by_rawg_id(self, db: Session, *, rawg_id: int) -> Game | None:
        """Retrieve a game by its RAWG.io ID (will not find custom games)."""
        # Explicitly check is_custom=False might be safer? Consider adding later.
        statement = select(Game).where(Game.rawg_id == rawg_id)
        return db.exec(statement).first()

    def get_by_slug(self, db: Session, *, slug: str) -> Game | None:
        """Retrieve a game by its unique slug."""
        statement = select(Game).where(Game.slug == slug)
        return db.exec(statement).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        is_custom: bool | None = None,  # Added filter
    ) -> List[Game]:
        """Retrieve multiple games with pagination and optional custom filter."""
        statement = select(Game)
        if is_custom is not None:
            statement = statement.where(Game.is_custom == is_custom)
        # Add ordering for consistent results
        statement = statement.order_by(Game.name).offset(skip).limit(limit)
        return db.exec(statement).all()

    def get_count(self, db: Session, *, is_custom: bool | None = None) -> int:
        """Get the total number of games, optionally filtered by type."""
        # Use func.count for efficiency, counting the primary key
        statement = select(func.count(Game.id)).select_from(Game)
        if is_custom is not None:
            statement = statement.where(Game.is_custom == is_custom)
        result = db.exec(statement).first()
        count = result if result is not None else 0
        return count

    def create(self, db: Session, *, obj_in: Any) -> Game:
        """
        Create a new game (RAWG or custom).
        Expects obj_in to be a schema like GameCreateSchema covering all fields.
        Sets is_custom flag and handles slug generation for custom games.
        """
        # Assume obj_in is a Pydantic model (like GameCreateSchema)
        game_data = obj_in.model_dump()

        # Determine if it's custom (e.g., based on a flag in obj_in or lack of rawg_id)
        is_custom_game = game_data.get("is_custom", False)

        # Ensure rawg_id is None for custom games and is_custom is True
        if is_custom_game:
            game_data["rawg_id"] = None
            game_data["is_custom"] = True

            # Generate unique slug for custom games if name is present
            if "name" in game_data:
                base_slug = slugify(game_data["name"])
                game_slug = base_slug
                counter = 1
                # Check for existing slugs efficiently
                while self.get_by_slug(db=db, slug=game_slug):
                    game_slug = f"{base_slug}-{counter}"
                    counter += 1
                game_data["slug"] = game_slug
            else:
                # Raise error or handle if name is required for custom game slugs
                raise ValueError(
                    "Cannot create custom game without a name for slug generation"
                )
        else:
            # For non-custom games, ensure is_custom is False
            game_data["is_custom"] = False
            # RAWG games should ideally have rawg_id and slug provided in obj_in
            if not game_data.get("slug") or not game_data.get("rawg_id"):
                # Potentially raise an error or handle missing required fields for RAWG games
                raise ValueError("RAWG ID and slug are required for non-custom games")

        # Validate the prepared data against the Game model
        db_obj = Game.model_validate(game_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # Add update method if needed, similar logic to check is_custom
    # def update(
    #     self,
    #     db: Session,
    #     *,
    #     db_obj: Game,
    #     obj_in: Any | dict[str, Any], # Expects GameUpdateSchema
    # ) -> Game:
    #     ...

    def remove(self, db: Session, *, id: uuid.UUID) -> Game | None:
        """Delete a game by its local UUID."""
        db_obj = self.get(db=db, id=id)  # Use self.get to retrieve
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj
