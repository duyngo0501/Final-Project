"""Service for synchronizing data from external APIs (e.g., RAWG) to the local database."""

import logging
from datetime import date
from sqlmodel import Session

# Import the existing RAWG client function
from app.services.game_api_client import get_rawg_games

# Import the CRUD object for games
from app.dal import game as crud_game

# Import the schema for creating games
from app.schemas.db_game import GameCreateSchema

logger = logging.getLogger(__name__)  # Use specific logger


def map_rawg_to_schema(rawg_data: dict) -> GameCreateSchema | None:
    """Maps a single RAWG game data dictionary to our GameCreateSchema."""
    try:
        # Basic validation and mapping
        released_date = None
        if rawg_data.get("released"):
            try:
                released_date = date.fromisoformat(rawg_data["released"])
            except (ValueError, TypeError):
                logger.warning(
                    f"Invalid date format for game {rawg_data.get('id')}: {rawg_data.get('released')}. Setting to None."
                )
                released_date = None

        # Ensure required fields are present
        if (
            not rawg_data.get("id")
            or not rawg_data.get("slug")
            or not rawg_data.get("name")
        ):
            logger.warning(
                f"Skipping RAWG game due to missing id, slug, or name: {rawg_data.get('id', 'N/A')}"
            )
            return None

        schema_data = {
            "rawg_id": rawg_data.get("id"),
            "slug": rawg_data.get("slug"),
            "name": rawg_data.get("name"),
            "released_date": released_date,
            "background_image": rawg_data.get("background_image"),
            "rating": rawg_data.get("rating"),
            "rating_top": rawg_data.get("rating_top"),
            "ratings_count": rawg_data.get("ratings_count"),
            "metacritic": rawg_data.get("metacritic"),
            "playtime": rawg_data.get("playtime"),
            "suggestions_count": rawg_data.get("suggestions_count"),
            "is_custom": False,  # Mark as not custom
            # Add other fields if available and needed, ensure defaults handle None
            "description": rawg_data.get(
                "description"
            ),  # Assuming RAWG might provide description sometimes
        }
        return GameCreateSchema(**schema_data)
    except Exception as e:
        logger.error(
            f"Error mapping RAWG data for game {rawg_data.get('id', 'N/A')}: {e}",
            exc_info=True,
        )
        return None


async def sync_rawg_games(
    session: Session, pages_to_sync: int = 1  # Limit pages synced on startup
) -> None:
    """Fetches games from RAWG and syncs them to the local database.

    Args:
        session: The database session to use for CRUD operations.
        pages_to_sync: How many pages of RAWG results to fetch and process.
    """
    logger.info(f"Starting RAWG game sync for {pages_to_sync} page(s)...")
    synced_count = 0
    skipped_count = 0

    for page_num in range(1, pages_to_sync + 1):
        logger.info(f"Fetching RAWG page {page_num}...")
        # Note: get_rawg_games is synchronous, run in threadpool if needed
        # For simplicity now, we call it directly. If it blocks startup significantly,
        # consider running it in a background task or using an async client.
        rawg_response = get_rawg_games(
            page=page_num, page_size=40
        )  # Fetch larger page size

        if not rawg_response or "results" not in rawg_response:
            logger.error(
                f"Failed to fetch RAWG games or invalid response for page {page_num}."
            )
            continue  # Move to next page or stop if desired

        rawg_games_list = rawg_response["results"]
        logger.info(
            f"Processing {len(rawg_games_list)} games from RAWG page {page_num}..."
        )

        for rawg_game_data in rawg_games_list:
            rawg_id = rawg_game_data.get("id")
            if not rawg_id:
                logger.warning("Skipping game with missing ID in RAWG data.")
                skipped_count += 1
                continue

            # Check if game already exists by RAWG ID
            existing_game = crud_game.get_by_rawg_id(db=session, rawg_id=rawg_id)

            if existing_game:
                # logger.debug(f"Game with RAWG ID {rawg_id} already exists, skipping.")
                skipped_count += 1
                continue
            else:
                # Map data and create new game
                game_schema = map_rawg_to_schema(rawg_game_data)
                if game_schema:
                    try:
                        created_game = crud_game.create(db=session, obj_in=game_schema)
                        # logger.info(f"Created new game: {created_game.name} (RAWG ID: {rawg_id})")
                        synced_count += 1
                    except ValueError as ve:
                        logger.error(
                            f"Validation error creating game from RAWG ID {rawg_id}: {ve}"
                        )
                        skipped_count += 1
                    except Exception as e:
                        logger.error(
                            f"Error creating game from RAWG ID {rawg_id}: {e}",
                            exc_info=True,
                        )
                        skipped_count += 1
                else:
                    skipped_count += 1
                    # Mapping error already logged in map_rawg_to_schema

        # Optional: Check if there are more pages in rawg_response['next'] if you want to sync all

    logger.info(
        f"RAWG game sync finished. Synced: {synced_count}, Skipped/Existing: {skipped_count}"
    )
