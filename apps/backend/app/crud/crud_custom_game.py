import uuid

from slugify import slugify  # Assuming slugify library is installed or available
from sqlmodel import Session, select

from app.models.custom_game import CustomGame
from app.schemas.custom_game import CustomGameCreate

# --- CRUD Operations for CustomGame ---


def create_custom_game(*, session: Session, game_in: CustomGameCreate) -> CustomGame:
    """Create a new custom game entry.

    Args:
        session: The database session.
        game_in: The schema object containing data for the new game.

    Returns:
        The newly created CustomGame database object.
    """
    # Generate a unique slug from the name
    # You might want more robust unique slug generation depending on requirements
    base_slug = slugify(game_in.name)
    game_slug = base_slug
    counter = 1
    while session.exec(select(CustomGame).where(CustomGame.slug == game_slug)).first():
        game_slug = f"{base_slug}-{counter}"
        counter += 1

    db_game = CustomGame.model_validate(game_in, update={"slug": game_slug})
    session.add(db_game)
    session.commit()
    session.refresh(db_game)
    return db_game


def delete_custom_game_by_id(
    *, session: Session, game_id: uuid.UUID
) -> CustomGame | None:
    """Delete a custom game by its ID.

    Args:
        session: The database session.
        game_id: The UUID of the game to delete.

    Returns:
        The deleted CustomGame object, or None if not found.
    """
    game = session.get(CustomGame, game_id)
    if game:
        session.delete(game)
        session.commit()
    return game


# Optional: Add functions for get, list, update if needed later
# def get_custom_game_by_id(...) -> CustomGame | None: ...
# def list_custom_games(...) -> list[CustomGame]: ...
