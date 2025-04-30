import requests
import os
import logging
import json
from typing import Optional, Dict, Any, List, Set
from datetime import datetime
import asyncio
import random  # Import random module

# --- Prisma Imports (Add these) ---
# Assuming your Prisma client is accessible via app.core.db
# Adjust the import path if necessary
from app.core.db import prisma, connect_db, disconnect_db
from prisma.errors import PrismaError, UniqueViolationError

# --- End Prisma Imports ---


# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Constants (Replace with environment variables or config loading) ---
RAWG_API_KEY = os.getenv(
    "RAWG_API_KEY", "59891088a3ff46ae939173a713ea675d"
)  # Replace with your actual key or load from env

RAWG_BASE_URL = "https://api.rawg.io/api"

# --- Cache Config (Add this) ---
CACHE_FILE = "rawg_visited_pages.json"
# --- End Cache Config ---


# --- Cache Functions (Add these) ---
def load_visited_pages() -> Set[int]:
    """Loads the set of visited page numbers from the cache file."""
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r") as f:
                data = json.load(f)
                # Ensure data is a list of integers before converting to set
                if isinstance(data, list) and all(
                    isinstance(item, int) for item in data
                ):
                    return set(data)
                else:
                    logging.warning(
                        f"Cache file {CACHE_FILE} has invalid format. Starting fresh."
                    )
                    return set()
        else:
            return set()
    except (IOError, json.JSONDecodeError) as e:
        logging.error(f"Error loading cache file {CACHE_FILE}: {e}. Starting fresh.")
        return set()


def save_visited_pages(visited: Set[int]):
    """Saves the set of visited page numbers to the cache file."""
    try:
        with open(CACHE_FILE, "w") as f:
            # Convert set to list for JSON serialization
            json.dump(list(visited), f)
    except IOError as e:
        logging.error(f"Error saving cache file {CACHE_FILE}: {e}")


# --- End Cache Functions ---


# --- RAWG.io API Client ---


def get_rawg_games(
    api_key: str = RAWG_API_KEY,
    page: int = 1,
    page_size: int = 20,
    ordering: Optional[str] = None,
    search: Optional[str] = None,
    genres: Optional[str] = None,
    platforms: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Fetches games from the RAWG.io API with optional filters.

    Args:
        api_key: Your RAWG.io API key.
        page: The page number to retrieve (default: 1).
        page_size: The number of results per page (max 40, default: 20).
        ordering: Field to order results by (e.g., '-rating', '-released').
        search: Search term for games.
        genres: Comma-separated genre IDs to filter by.
        platforms: Comma-separated platform IDs to filter by.

    Returns:
        A dictionary containing the API response (usually a list of games
        and pagination info) or None if an error occurs.
    """
    if not api_key:
        logging.error("RAWG API key is missing.")
        return None

    params = {
        "key": api_key,
        "page": page,
        "page_size": page_size,
    }
    if ordering:
        params["ordering"] = ordering
    if search:
        params["search"] = search
    if genres:
        params["genres"] = genres
    if platforms:
        params["platforms"] = platforms

    logging.info(f"Fetching RAWG games page {page} with params: {params}")
    try:
        response = requests.get(
            f"{RAWG_BASE_URL}/games",
            params=params,
            headers={"Accept": "application/json"},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        logging.error(f"Timeout while fetching RAWG games page {page}.")
        return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching RAWG games page {page}: {e}")
        status_code = response.status_code if "response" in locals() else "N/A"
        response_text = response.text if "response" in locals() else "N/A"
        logging.error(f"Response status: {status_code}")
        if status_code == 404:
            logging.warning(f"Page {page} not found (404). Stopping.")
            return None
        return None


# --- Crawling and Storing Logic (BULK REFACTORED function) ---
async def crawl_and_store_rawg_games(
    max_pages: Optional[int] = None, page_size: int = 40
):
    """
    Crawls games from the RAWG API, stores them in the database with relations
    using bulk operations for related entities, and caches visited pages.
    """
    if not prisma.is_connected():
        await connect_db()

    # --- Delete existing games before crawling (optional) ---
    logging.info("Wiping existing Game table before crawl...")
    try:
        delete_result = await prisma.game.delete_many({})
        logging.info(f"Successfully deleted {delete_result} existing games.")
    except PrismaError as e:
        logging.error(f"Error wiping Game table: {e}. Aborting crawl.")
        return  # Stop if we can't wipe the table
    # --- End Deletion ---

    visited_pages = load_visited_pages()
    current_page = 1
    games_processed_count = 0
    total_pages_processed = 0

    while True:
        # --- Loop Setup ---
        if max_pages is not None and current_page > max_pages:
            logging.info(f"Reached max page limit ({max_pages}). Stopping crawl.")
            break

        if current_page in visited_pages:
            logging.info(f"Page {current_page} already visited (cached). Skipping.")
            current_page += 1
            continue

        # --- Fetch Page Data ---
        page_data = get_rawg_games(page=current_page, page_size=page_size)

        if not page_data or not page_data.get("results"):
            logging.warning(
                f"No results found for page {current_page} or fetch failed. Stopping crawl."
            )
            visited_pages.add(current_page)
            save_visited_pages(visited_pages)
            break  # Stop if no results or error

        games_on_page = page_data["results"]
        logging.info(
            f"Processing {len(games_on_page)} games from page {current_page}..."
        )

        # --- Step 4: Process Games Individually (Upsert ONLY CORE DATA) ---
        page_games_processed = 0
        for game_data in games_on_page:
            rawg_id = game_data.get("id")
            game_name = game_data.get("name")
            game_slug = game_data.get("slug")

            if not rawg_id or not game_name or not game_slug:
                continue

            try:
                # --- 4a. Prepare Game Data (Explicit Mapping) ---
                released_date_str = game_data.get("released")
                released_dt = None
                if released_date_str:
                    try:
                        if len(released_date_str) == 4 and released_date_str.isdigit():
                            released_dt = datetime(int(released_date_str), 1, 1)
                        else:
                            released_dt = datetime.strptime(
                                released_date_str, "%Y-%m-%d"
                            )
                    except ValueError:
                        pass

                random_price = round(random.uniform(5.00, 70.00), 2)

                # Explicitly map desired fields according to Prisma schema
                game_payload_raw = {
                    "rawg_id": rawg_id,
                    "slug": game_slug,
                    "name": game_name,
                    "tba": game_data.get("tba", False),
                    "released_date": released_dt,  # Mapped via @map("released")
                    "background_image": game_data.get("background_image"),
                    "rating": game_data.get("rating"),
                    "rating_top": game_data.get("rating_top"),
                    "ratings_count": game_data.get("ratings_count"),
                    "reviews_text_count": game_data.get("reviews_text_count"),
                    "added": game_data.get("added"),
                    "metacritic": game_data.get("metacritic"),
                    "playtime": game_data.get("playtime"),
                    "suggestions_count": game_data.get("suggestions_count"),
                    "reviews_count": game_data.get("reviews_count"),
                    "saturated_color": game_data.get("saturated_color"),
                    "dominant_color": game_data.get("dominant_color"),
                    "description": game_data.get(
                        "description"
                    ),  # Added description mapping
                    "price": random_price,
                    "is_custom": False,  # Mapped via @map("is_custom")
                    # created_by_admin_id is nullable, handled by Prisma
                    # created_at and updated_at are handled by Prisma
                }

                # Filter out None values for create payload
                game_payload_create = {
                    k: v for k, v in game_payload_raw.items() if v is not None
                }

                # Create update payload (remove identifiers and non-updatable fields)
                # Keep fields that might change based on RAWG updates
                updatable_fields = [
                    "tba",
                    "released_date",
                    "background_image",
                    "rating",
                    "rating_top",
                    "ratings_count",
                    "reviews_text_count",
                    "added",
                    "metacritic",
                    "playtime",
                    "suggestions_count",
                    "reviews_count",
                    "saturated_color",
                    "dominant_color",
                    "description",
                    # Price and is_custom are managed internally, not updated from RAWG
                ]
                game_payload_update = {
                    k: v
                    for k, v in game_payload_create.items()
                    if k in updatable_fields
                }

                # --- 4b. Upsert Game ---
                game_in_db = await prisma.game.upsert(
                    where={"rawg_id": rawg_id},
                    data={
                        "create": game_payload_create,
                        "update": game_payload_update,
                    },
                )
                db_game_id = game_in_db.id

                page_games_processed += 1

            except UniqueViolationError as uve:
                logging.warning(
                    f"Unique constraint error during game upsert {game_name} (RAWG ID: {rawg_id}): {uve}. Might already exist."
                )
            except PrismaError as pe:
                logging.error(
                    f"Prisma error processing game {game_name} (RAWG ID: {rawg_id}): {pe}"
                )
            except Exception as exc:
                logging.error(
                    f"Unexpected error processing game {game_name} (RAWG ID: {rawg_id}): {exc}",
                    exc_info=True,
                )

        # --- After processing all games on page ---
        visited_pages.add(current_page)
        save_visited_pages(visited_pages)
        total_pages_processed += 1
        games_processed_count += page_games_processed
        logging.info(
            f"Finished processing page {current_page}. Games processed on page: {page_games_processed}. Total processed so far: {games_processed_count}"
        )

        # Check next page and sleep
        if not page_data.get("next"):
            logging.info("No next page indicated by API. Stopping crawl.")
            break
        current_page += 1
        await asyncio.sleep(1.5)

    logging.info(
        f"RAWG Crawl finished. Processed {total_pages_processed} new pages. Total games processed: {games_processed_count}."
    )


# --- Updated Example Usage ---
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Crawl games from RAWG API and store in DB."
    )
    parser.add_argument(
        "--pages",
        type=int,
        default=None,
        help="Maximum number of pages to crawl (default: crawl all)",
    )
    parser.add_argument(
        "--pagesize",
        type=int,
        default=40,
        help="Number of games per page (default: 40)",
    )
    parser.add_argument(
        "--clear-cache",
        action="store_true",
        help="Clear the visited pages cache before starting",
    )

    args = parser.parse_args()

    if args.clear_cache:
        logging.info("Clearing visited pages cache...")
        if os.path.exists(CACHE_FILE):
            try:
                os.remove(CACHE_FILE)
                logging.info("Cache cleared.")
            except OSError as e:
                logging.error(f"Error removing cache file {CACHE_FILE}: {e}")
        else:
            logging.info("Cache file not found, nothing to clear.")

    async def main():
        await connect_db()
        try:
            await crawl_and_store_rawg_games(
                max_pages=args.pages, page_size=args.pagesize
            )
        finally:
            if prisma.is_connected():
                await disconnect_db()

    asyncio.run(main())
