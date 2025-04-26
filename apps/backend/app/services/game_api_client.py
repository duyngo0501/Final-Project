import requests
import os
import logging
from typing import Optional, Dict, Any, List

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Constants (Replace with environment variables or config loading) ---
RAWG_API_KEY = os.getenv(
    "RAWG_API_KEY", "f245292c2cc5405eb107e1a096788a5c"
)  # Replace with your actual key or load from env
IGDB_CLIENT_ID = os.getenv(
    "IGDB_CLIENT_ID", "cc9zww2fcj649g5ur70torotut29rz"
)  # Replace or load from env
IGDB_CLIENT_SECRET = os.getenv(
    "IGDB_CLIENT_SECRET", "i9lumcnzd1ymcvzp5f8hjv1y9otjq0"
)  # Replace or load from env

RAWG_BASE_URL = "https://api.rawg.io/api"
IGDB_AUTH_URL = "https://id.twitch.tv/oauth2/token"
IGDB_API_URL = "https://api.igdb.com/v4"

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

    try:
        response = requests.get(
            f"{RAWG_BASE_URL}/games",
            params=params,
            headers={"Accept": "application/json"},
        )
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching RAWG games: {e}")
        logging.error(
            f"Response status: {response.status_code if 'response' in locals() else 'N/A'}"
        )
        logging.error(
            f"Response text: {response.text if 'response' in locals() else 'N/A'}"
        )
        return None


# --- IGDB API Client ---


def get_igdb_token(
    client_id: str = IGDB_CLIENT_ID,
    client_secret: str = IGDB_CLIENT_SECRET,
) -> Optional[str]:
    """
    Obtains an OAuth access token from Twitch/IGDB.

    Args:
        client_id: Your IGDB Client ID.
        client_secret: Your IGDB Client Secret.

    Returns:
        The access token string or None if an error occurs.
    """
    if not client_id or not client_secret:
        logging.error("IGDB Client ID or Client Secret is missing.")
        return None

    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials",
    }
    try:
        response = requests.post(
            IGDB_AUTH_URL, data=data, headers={"Accept": "application/json"}
        )
        response.raise_for_status()
        token_data = response.json()
        if "access_token" in token_data:
            logging.info("Successfully obtained IGDB access token.")
            return token_data["access_token"]
        else:
            logging.error(f"Failed to get access token, response: {token_data}")
            return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Error obtaining IGDB token: {e}")
        logging.error(
            f"Response status: {response.status_code if 'response' in locals() else 'N/A'}"
        )
        logging.error(
            f"Response text: {response.text if 'response' in locals() else 'N/A'}"
        )
        return None


def query_igdb(
    endpoint: str,
    client_id: str,
    access_token: str,
    query_body: str,
) -> Optional[List[Dict[str, Any]]]:
    """
    Sends a query to a specified IGDB API endpoint using Apocalpypto syntax.

    Args:
        endpoint: The specific API endpoint (e.g., 'games', 'genres').
        client_id: Your IGDB Client ID.
        access_token: Your valid IGDB OAuth access token.
        query_body: The Apocalpypto query string.

    Returns:
        A list of dictionaries representing the results (e.g., list of games)
        or None if an error occurs.
    """
    if not client_id or not access_token:
        logging.error("IGDB Client ID or Access Token is missing for query.")
        return None

    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        # 'Content-Type': 'text/plain' # Usually not needed for raw string body with requests
    }
    try:
        response = requests.post(
            f"{IGDB_API_URL}/{endpoint}",
            headers=headers,
            data=query_body.encode("utf-8"),
        )  # Encode body to bytes
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error querying IGDB {endpoint}: {e}")
        logging.error(
            f"Response status: {response.status_code if 'response' in locals() else 'N/A'}"
        )
        logging.error(
            f"Response text: {response.text if 'response' in locals() else 'N/A'}"
        )
        return None


# --- Example Usage ---
if __name__ == "__main__":
    print("--- Testing RAWG.io API ---")

    # Basic RAWG query
    print("\\n>>> Basic RAWG Games Query:")
    rawg_games_basic = get_rawg_games()
    if rawg_games_basic and rawg_games_basic.get("results"):
        print(
            f"Found {rawg_games_basic.get('count', 0)} games. First game: {rawg_games_basic['results'][0]['name']}"
        )
    else:
        print("Failed to fetch basic RAWG games.")

    # Filtered RAWG query
    print("\\n>>> Filtered RAWG Games Query (Zelda, ordered by rating):")
    rawg_games_filtered = get_rawg_games(search="zelda", ordering="-rating")
    if rawg_games_filtered and rawg_games_filtered.get("results"):
        print(
            f"Found {rawg_games_filtered.get('count', 0)} games matching 'zelda'. Top rated: {rawg_games_filtered['results'][0]['name']}"
        )
    else:
        print("Failed to fetch filtered RAWG games.")

    print("\\n--- Testing IGDB API ---")

    # Get IGDB Token
    print("\\n>>> Obtaining IGDB Token...")
    igdb_token = get_igdb_token()

    if not igdb_token:
        print("Failed to obtain IGDB token. Cannot proceed with IGDB tests.")
        print("Please ensure IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are set correctly.")
    else:
        print("Successfully obtained IGDB token.")

        # Basic IGDB Query (as provided by user)
        print("\\n>>> Basic IGDB Games Query:")
        query_basic = """
        fields name,summary,cover.url,rating,release_dates.date,genres.name;
        limit 20;
        sort rating desc;
        where rating != null;
        """
        igdb_games_basic = query_igdb("games", IGDB_CLIENT_ID, igdb_token, query_basic)
        if igdb_games_basic:
            print(
                f"Found {len(igdb_games_basic)} games. First game: {igdb_games_basic[0]['name']}"
            )
        else:
            print("Failed to fetch basic IGDB games.")

        # Popular IGDB Games Query
        print("\\n>>> Popular IGDB Games Query:")
        query_popular = """
        fields name,summary,cover.url,rating;
        limit 20;
        sort rating desc;
        where rating != null;
        """
        igdb_games_popular = query_igdb(
            "games", IGDB_CLIENT_ID, igdb_token, query_popular
        )
        if igdb_games_popular:
            print(
                f"Found {len(igdb_games_popular)} popular games. First game: {igdb_games_popular[0]['name']}"
            )
        else:
            print("Failed to fetch popular IGDB games.")

        # Search IGDB Games Query
        print("\\n>>> Search IGDB Games Query (Zelda):")
        query_search = """
        search "zelda";
        fields name,summary,cover.url,rating;
        limit 20;
        """
        igdb_games_search = query_igdb(
            "games", IGDB_CLIENT_ID, igdb_token, query_search
        )
        if igdb_games_search:
            print(
                f"Found {len(igdb_games_search)} games matching 'zelda'. First result: {igdb_games_search[0]['name']}"
            )
        else:
            print("Failed to fetch search results for 'zelda' from IGDB.")

        # Recent IGDB Games Query
        print("\\n>>> Recent IGDB Games Query:")
        query_recent = """
        fields name,summary,cover.url,first_release_date;
        limit 20;
        sort first_release_date desc;
        where first_release_date < timestamp(); // Using timestamp() function for 'now'
        """
        igdb_games_recent = query_igdb(
            "games", IGDB_CLIENT_ID, igdb_token, query_recent
        )
        if igdb_games_recent:
            # Sort results locally by date desc as API might not guarantee strict ordering after filtering
            from datetime import datetime

            igdb_games_recent.sort(
                key=lambda x: x.get("first_release_date", 0), reverse=True
            )
            release_date_unix = igdb_games_recent[0].get("first_release_date")
            release_date_str = (
                datetime.utcfromtimestamp(release_date_unix).strftime("%Y-%m-%d")
                if release_date_unix
                else "N/A"
            )
            print(
                f"Found {len(igdb_games_recent)} recent games. Most recent: {igdb_games_recent[0]['name']} (Released: {release_date_str})"
            )
        else:
            print("Failed to fetch recent IGDB games.")
