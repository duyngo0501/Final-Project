"""Service for synchronizing data from external APIs (e.g., RAWG) to the local database."""

import logging
import asyncio  # Import asyncio
import httpx  # Use httpx for async requests if possible, or keep requests for threadpool
from datetime import date
from sqlmodel import (
    Session,
    SQLModel,
    select,
    create_engine,
)  # Need create_engine if passing engine
from sqlalchemy.future import Engine  # Type hint for engine

# Import the existing RAWG client function
from app.services.game_api_client import get_rawg_games, RAWG_API_KEY

# Import the CRUD object for games
from app.dal import game as crud_game

# Import the Game model itself for the bulk query
from app.models import Game  # Adjust path if model is elsewhere

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
    *,
    engine: Engine,
    pages_to_sync: int | None = None,  # Accept engine, pages_to_sync can be None
) -> None:
    """Fetches ALL games from RAWG and syncs them to the local database.

    Runs as an async background task.
    Uses run_in_threadpool for synchronous HTTP requests.
    Creates its own session per page/batch.
    Includes rate limiting.

    Args:
        engine: SQLAlchemy engine instance for creating sessions.
        pages_to_sync: Max number of pages to sync (None means sync all).
    """
    logger.info(
        f"Starting RAWG game sync. Max pages: {'All' if pages_to_sync is None else pages_to_sync}."
    )
    synced_count = 0
    skipped_count = 0
    error_count = 0
    page_num = 1
    next_page_url: str | None = (
        f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&page_size=40"  # Initial URL
    )

    loop = asyncio.get_running_loop()

    while next_page_url:
        if pages_to_sync is not None and page_num > pages_to_sync:
            logger.info(f"Reached page limit ({pages_to_sync}), stopping sync.")
            break

        logger.info(f"Processing RAWG page {page_num}...")

        try:
            rawg_response = await asyncio.to_thread(
                get_rawg_games, page=page_num, page_size=40
            )

            if not rawg_response or "results" not in rawg_response:
                logger.error(
                    f"Failed to fetch RAWG games or invalid response for page {page_num}. Response: {rawg_response}"
                )
                error_count += 1
                await asyncio.sleep(10)
                page_num += 1
                continue

            rawg_games_list = rawg_response.get("results", [])
            next_page_url = rawg_response.get("next")

            logger.info(
                f"Processing {len(rawg_games_list)} games from RAWG page {page_num}... (Next page URL: {next_page_url is not None})"
            )

            if not rawg_games_list:
                logger.info(f"No results on page {page_num}, continuing...")
                page_num += 1
                if next_page_url:
                    await asyncio.sleep(1)
                continue  # Skip DB interaction if no games on page

            # --- Batch Processing Logic ---
            ids_on_page = {g["id"] for g in rawg_games_list if g.get("id")}
            data_by_id = {g["id"]: g for g in rawg_games_list if g.get("id")}

            games_to_create: list[GameCreateSchema] = []
            existing_ids_in_db: set[int] = set()

            with Session(engine) as session:
                try:
                    # Bulk check for existing IDs
                    if ids_on_page:
                        statement = select(Game.rawg_id).where(
                            Game.rawg_id.in_(ids_on_page)
                        )
                        results = session.exec(statement).all()
                        existing_ids_in_db = set(results)
                        logger.debug(
                            f"Page {page_num}: Found {len(existing_ids_in_db)} existing games out of {len(ids_on_page)}."
                        )

                    # Identify and map new games
                    new_game_count_page = 0
                    for rawg_id in ids_on_page:
                        if rawg_id not in existing_ids_in_db:
                            rawg_game_data = data_by_id.get(rawg_id)
                            if rawg_game_data:
                                game_schema = map_rawg_to_schema(rawg_game_data)
                                if game_schema:
                                    # Add the model instance directly to the session
                                    # Create a Game instance from the schema if needed, or if CRUD handles it
                                    # Assuming Game model can be instantiated from GameCreateSchema or CRUD handles it
                                    # This depends on your Game model definition and CRUD logic
                                    # For simplicity, let's assume we add the schema and CRUD/SQLModel handles it
                                    # If not, you'd do: game_model = Game.model_validate(game_schema); session.add(game_model)
                                    session.add(
                                        Game(**game_schema.model_dump())
                                    )  # Example: Directly add model instance
                                    new_game_count_page += 1
                                else:
                                    # Mapping error logged in map_rawg_to_schema
                                    error_count += 1
                        else:
                            skipped_count += 1  # Increment skipped for existing games

                    # Commit all additions for this page
                    if new_game_count_page > 0:
                        session.commit()
                        synced_count += new_game_count_page
                        logger.info(
                            f"Page {page_num}: Committed {new_game_count_page} new games."
                        )
                    else:
                        logger.info(f"Page {page_num}: No new games to commit.")
                        # No need to commit if nothing was added

                except Exception as db_exc:
                    logger.error(
                        f"Database error processing page {page_num}: {db_exc}",
                        exc_info=True,
                    )
                    error_count += 1
                    try:
                        session.rollback()  # Rollback on error for this page
                    except Exception as rb_exc:
                        logger.error(
                            f"Failed to rollback session for page {page_num}: {rb_exc}",
                            exc_info=True,
                        )
            # --- End Batch Processing Logic ---

        except Exception as e:
            logger.error(
                f"An unexpected error occurred processing page {page_num}: {e}",
                exc_info=True,
            )
            error_count += 1
            await asyncio.sleep(10)

        page_num += 1
        if next_page_url:
            await asyncio.sleep(1)

    logger.info(
        f"RAWG game sync finished. Total Synced: {synced_count}, Skipped/Existing: {skipped_count}, Errors: {error_count}"
    )
