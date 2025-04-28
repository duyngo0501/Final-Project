from datetime import datetime  # Add datetime for Pydantic models
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Path, Request, status
from pydantic import BaseModel, Field  # Import BaseModel and Field

from db import get_db

# Dependencies
from deps import AdminUser, DbDep  # DbDep should now provide Prisma Client
from prisma import Client as PrismaClient  # Import Prisma client type

# Import Prisma errors and client type
from prisma.errors import PrismaError, RecordNotFoundError, UniqueViolationError
from prisma.models import Game  # Import Prisma-generated models


class GameListingResponse(BaseModel):
    items: list[Game]
    total: int
    page: int
    limit: int
    pages: int


class GameCreateSchema(BaseModel):
    # Define fields required to create a game - adjust based on your actual needs
    name: str = Field(..., examples=["Cyberpunk 2077"])
    description: str | None = Field(None, examples=["An open-world action RPG."])
    price: float | None = Field(None, examples=[59.99])
    released_date: datetime | None = Field(None, examples=["2020-12-10T00:00:00Z"])
    background_image: str | None = Field(
        None, examples=["https://example.com/image.jpg"]
    )
    # Add other necessary fields like rating, metacritic, etc.


class SyncResponse(BaseModel):
    status: str
    results: Any  # Or define a more specific model if the results structure is known


# Remove unused imports related to old schemas
# from app.schemas.db_game import (
#     GameCreateSchema,
# )

router = APIRouter()

# --- Remove Placeholder Data ---
# DUMMY_PRODUCTS = [ ... ]


@router.get(
    "/",
    response_model=GameListingResponse,  # ADDED back with local model
    operation_id="GameController_listGames",
    summary="List Games",
    description="Retrieve a list of games with filtering, sorting, and pagination.",
)
async def list_games(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    sort_by: str = "",
    is_asc: bool = True,
) -> Any:
    db = await get_db()
    """
    Retrieve a list of games from the local database with pagination using Prisma.
    Optionally filter by search term, and sort the results.
    Returns raw Prisma Game objects along with pagination info.
    """
    # --- Build Prisma Query ---
    where_clause = {}
    if search:
        where_clause["name"] = {"contains": search, "mode": "insensitive"}

    order_by = None
    if sort_by:
        field = sort_by
        direction = "asc" if is_asc else "desc"
        allowed_sort_fields = [
            "name",
            "price",
            "released_date",
            "rating",
            "metacritic",
            "created_at",
        ]
        if field in allowed_sort_fields:
            order_by = [{field: direction}]
    # ------------------------

    try:
        total = await db.game.count(where=where_clause)
        items = await db.game.find_many(
            where=where_clause, skip=skip, take=limit, order=order_by
        )
        pages = (total + limit - 1) // limit if limit > 0 else 0

        # Validate and return using the local Pydantic model
        return GameListingResponse(
            items=[GameWithRelations.model_validate(item) for item in items],
            total=total,
            page=(skip // limit) + 1,
            limit=limit,
            pages=pages,
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error fetching game list: {e}"
        )
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=500, detail=f"Internal server error fetching game list: {e}"
        )


# --- Combined Create/Delete Endpoints ---


@router.post(
    "/",
    response_model=GameWithRelations,  # ADDED back with local model
    status_code=status.HTTP_201_CREATED,
    operation_id="GameController_createGame",
)
async def create_game_endpoint(
    *,
    db: PrismaClient = Depends(DbDep),
    game_in: GameCreateSchema,  # Use local GameCreateSchema
    admin_user: AdminUser,
):
    """Create a new game. Returns the created game validated against the local model."""
    try:
        # Ensure relations (platforms, categories) are handled if part of GameCreateSchema
        # This example assumes GameCreateSchema only contains direct Game fields
        data_to_create = game_in.model_dump(exclude_unset=True)
        # If GameCreateSchema includes platform/category names or IDs,
        # you'd need logic here to connect them during creation.
        new_game_prisma = await db.game.create(data=data_to_create)
    except UniqueViolationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Game creation failed due to unique constraint: {e}",
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error creating game: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating game: {e}",
        )
    # Validate and return using the local Pydantic model
    return GameWithRelations.model_validate(new_game_prisma)


@router.delete(
    "/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="GameController_deleteGame",
)
async def delete_game_endpoint(
    *, db: PrismaClient = Depends(DbDep), game_id: str, admin_user: AdminUser
):
    """Delete a game by its local ID."""
    try:
        await db.game.delete(where={"id": game_id})
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error deleting game: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting game: {e}",
        )
    return None


# --- Endpoint for Game Details ---
@router.get(
    "/{game_id}",
    response_model=GameWithRelations,  # ADDED back with local model
    operation_id="GameController_getGame",
    summary="Get Game Details",
    description="Retrieve detailed information for a specific game by its UUID.",
)
async def get_game_details(
    game_id: str = Path(..., description="The UUID of the game to retrieve"),
    db: PrismaClient = Depends(DbDep),
):
    """Retrieves detailed game info including platforms/categories as raw Prisma object."""
    try:
        db_game = await db.game.find_unique(where={"id": game_id})
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error fetching game details: {e}"
        )
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=500, detail=f"Internal server error fetching game details: {e}"
        )

    if db_game is None:
        raise HTTPException(status_code=404, detail=f"Game with id {game_id} not found")

    # Validate and return using the local Pydantic model
    return GameWithRelations.model_validate(db_game)


# --- Comment out the non-functional /sync-rawg endpoint ---
# @router.post(
#     "/sync-rawg",
#     response_model=SyncResponse,  # ADDED back with local model
#     dependencies=[Depends(AdminUser)],
#     operation_id="GameController_syncRawg",
#     summary="Sync Games from RAWG",
#     description="Fetch games from the RAWG API and store them in the database. Admin access required.",
# )
# async def sync_rawg(
#     db: PrismaClient = Depends(DbDep),
#     pages: int = 1,
# ):
#     """Fetch games from the RAWG API and store them in the database."""
#     try:
#         # Call the (currently missing) service function
#         # sync_results = await fetch_games_from_rawg(db_session=db, pages_to_fetch=pages)
#         sync_results = {"status": "success", "results": "Sync logic needs implementation"}
#         return SyncResponse(status="success", results=sync_results)
#     except Exception as e:
#         logger.error(f"Error during RAWG sync: {e}")
#         raise HTTPException(
#             status_code=500, detail=f"Failed to sync games from RAWG: {e}"
#         )
