import uuid

from fastapi import APIRouter, HTTPException, Query, status

# Dependencies
from app.api.deps import AdminUser, SessionDep  # Import SessionDep and AdminUser

# CRUD
from app.crud import crud_custom_game

# Models (for type hinting in dependencies)
from app.schemas.custom_game import CustomGameCreate, CustomGamePublic

# Assuming schemas are defined in app.schemas.product
from app.schemas.product import ProductListingResponse

router = APIRouter()

# --- Placeholder Data ---
# Replace this with actual data fetching logic (DB query, external API call, etc.)
DUMMY_PRODUCTS = [
    {
        "id": 3498,
        "slug": "grand-theft-auto-v",
        "name": "Grand Theft Auto V",
        "released": "2013-09-17",
        "tba": False,
        "background_image": (
            "https://media.rawg.io/media/games/456/"
            "456dea5e1c7e3cd07060c14e96612691.jpg"
        ),
        "rating": 4.47,
        "rating_top": 5,
        "ratings_count": 6853,
        "metacritic": 92,
        "playtime": 74,
        "suggestions_count": 428,
        "updated": "2024-04-19T12:49:44",
        "platforms": [
            {
                "platform": {
                    "id": 187,
                    "name": "PlayStation 5",
                    "slug": "playstation5",
                },
                "released_at": "2013-09-17",
            },
            {
                "platform": {
                    "id": 186,
                    "name": "Xbox Series S/X",
                    "slug": "xbox-series-x",
                },
                "released_at": "2013-09-17",
            },
            {
                "platform": {"id": 4, "name": "PC", "slug": "pc"},
                "released_at": "2013-09-17",
            },
        ],
        "parent_platforms": [
            {"platform": {"id": 1, "name": "PC", "slug": "pc"}},
            {"platform": {"id": 2, "name": "PlayStation", "slug": "playstation"}},
        ],
        "genres": [
            {"id": 4, "name": "Action", "slug": "action"},
            {"id": 3, "name": "Adventure", "slug": "adventure"},
        ],
    },
    # Add more dummy products if needed
    {
        "id": 3328,
        "slug": "the-witcher-3-wild-hunt",
        "name": "The Witcher 3: Wild Hunt",
        "released": "2015-05-18",
        "tba": False,
        "background_image": (
            "https://media.rawg.io/media/games/618/"
            "618c2031a07bbff6b4f611f10b6bcdbc.jpg"
        ),
        "rating": 4.66,
        "rating_top": 5,
        "ratings_count": 6600,
        "metacritic": 92,
        "playtime": 47,
        "suggestions_count": 677,
        "updated": "2024-04-17T14:29:35",
        "platforms": [
            {
                "platform": {"id": 4, "name": "PC", "slug": "pc"},
                "released_at": "2015-05-18",
            },
            {
                "platform": {"id": 18, "name": "PlayStation 4", "slug": "playstation4"},
                "released_at": "2015-05-18",
            },
        ],
        "parent_platforms": [{"platform": {"id": 1, "name": "PC", "slug": "pc"}}],
        "genres": [
            {"id": 4, "name": "Action", "slug": "action"},
            {"id": 3, "name": "Adventure", "slug": "adventure"},
            {"id": 5, "name": "RPG", "slug": "role-playing-games-rpg"},
        ],
    },
]
# --- End Placeholder Data ---


@router.get("/", response_model=ProductListingResponse)
def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Retrieve a list of products (games) with pagination,
    following a structure similar to the RAWG.io API.

    **Note:** Currently returns placeholder data. Does NOT include custom games.
    """
    # Basic pagination logic for dummy data
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_results = DUMMY_PRODUCTS[start_index:end_index]

    # Simulate next/previous links (replace with actual logic)
    base_url = "/api/v1/products/"  # Adjust if your prefix changes
    next_url = (
        f"{base_url}?page={page + 1}&page_size={page_size}"
        if end_index < len(DUMMY_PRODUCTS)
        else None
    )
    previous_url = (
        f"{base_url}?page={page - 1}&page_size={page_size}" if page > 1 else None
    )

    return ProductListingResponse(
        count=len(DUMMY_PRODUCTS),
        next=next_url,
        previous=previous_url,
        results=paginated_results,
    )


# --- Admin Endpoints for Custom Games ---


@router.post(
    "/custom-games/",
    response_model=CustomGamePublic,
    status_code=status.HTTP_201_CREATED,
)
def create_custom_game_endpoint(
    *,
    session: SessionDep,
    game_in: CustomGameCreate,
    admin_user: AdminUser,  # Protect endpoint
):
    """
    Create a new custom game (Admin only).
    """
    # Optional: Could add admin_user.id to the game data if tracking needed
    custom_game = crud_custom_game.create_custom_game(session=session, game_in=game_in)
    return custom_game


@router.delete("/custom-games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_game_endpoint(
    *,
    session: SessionDep,
    game_id: uuid.UUID,
    admin_user: AdminUser,  # Protect endpoint
):
    """
    Delete a custom game by ID (Admin only).
    """
    deleted_game = crud_custom_game.delete_custom_game_by_id(
        session=session, game_id=game_id
    )
    if not deleted_game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Custom game not found"
        )
    # No content returned on successful deletion


# --- Optional Endpoints ---

# You could add endpoints to list or get specific custom games if needed
# @router.get("/custom-games/", response_model=List[CustomGamePublic])
# def list_custom_games_endpoint(session: SessionDep, skip: int = 0, limit: int = 100):
#     games = crud_custom_game.list_custom_games(session=session, skip=skip, limit=limit)
#     return games

# @router.get("/custom-games/{game_id}", response_model=CustomGamePublic)
# def get_custom_game_endpoint(session: SessionDep, game_id: uuid.UUID):
#     game = crud_custom_game.get_custom_game_by_id(session=session, game_id=game_id)
#     if not game:
#         raise HTTPException(status_code=404, detail="Custom game not found")
#     return game

# You can add more endpoints here, e.g., get_product_by_id
# @router.get("/{product_id}", response_model=Product)
# def get_product(product_id: int): ...
