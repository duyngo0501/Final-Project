import uuid
from typing import List, Any, Annotated, Optional
from datetime import datetime  # Add datetime for Pydantic models
from app.core.db import get_db
from fastapi import APIRouter, Depends, HTTPException, status, Request, Path
from fastapi.routing import Request as FastAPIRequest
from pydantic import BaseModel, Field  # Import BaseModel and Field

# Import Prisma errors and client type
from prisma.errors import PrismaError, RecordNotFoundError, UniqueViolationError
from prisma import Client as PrismaClient  # Import Prisma client type
from prisma.models import Game  # Import Prisma-generated models

# Dependencies
from app.core.deps import DbDep, AdminUser  # DbDep should now provide Prisma Client

# CRUD - Remove DAL import
# from app.dal import crud_game

# Models & Schemas - Use renamed schemas from db_game

# from app.schemas.db_game import GameReadSchema # Update commented import
# from app.schemas.game import GameReadSchema

# Remove unused import
# from app.services.game_api_client import get_rawg_games

# --- Define Local Pydantic Models Inheriting from Prisma Models ---


# Remove PlatformItem
# class PlatformItem(
#     Platform, BaseModel
# ):  # Inherit from Prisma Platform and Pydantic BaseModel
#     # Fields are inherited from prisma.models.Platform
#     # id: str
#     # name: str
#
#     class Config:
#         from_attributes = True


# Remove CategoryItem
# class CategoryItem(
#     Category, BaseModel
# ):  # Inherit from Prisma Category and Pydantic BaseModel
#     # Fields are inherited from prisma.models.Category
#     # id: str
#     # name: str
#
#     class Config:
#         from_attributes = True


class GameWithRelations(
    Game, BaseModel
):  # Inherit from Prisma Game and Pydantic BaseModel
    # Most fields are inherited from prisma.models.Game
    # id: str
    # name: str
    # slug: Optional[str] = None
    # description: Optional[str] = None
    # metacritic: Optional[int] = None
    # released_date: Optional[datetime] = None
    # background_image: Optional[str] = None
    # website: Optional[str] = None
    # rating: Optional[float] = None
    # rating_top: Optional[int] = None
    # ratings_count: Optional[int] = None
    # reviews_text_count: Optional[int] = None
    # added: Optional[int] = None
    # suggestions_count: Optional[int] = None
    # updated_at: Optional[datetime] = None
    # reviews_count: Optional[int] = None
    # saturated_color: Optional[str] = None
    # dominant_color: Optional[str] = None
    # price: Optional[float] = None
    # created_at: datetime

    # Explicitly define relation fields with the correct Pydantic types
    # Remove platforms and categories
    # platforms: List[PlatformItem] = []
    # categories: List[CategoryItem] = []

    class Config:
        from_attributes = True  # Enable ORM mode


class GameListingResponse(BaseModel):
    items: List[GameWithRelations]
    total: int
    page: int
    limit: int
    pages: int


class GameCreateSchema(BaseModel):
    # Define fields required to create a game - adjust based on your actual needs
    name: str = Field(..., examples=["Cyberpunk 2077"])
    description: Optional[str] = Field(None, examples=["An open-world action RPG."])
    price: Optional[float] = Field(None, examples=[59.99])
    released_date: Optional[datetime] = Field(None, examples=["2020-12-10T00:00:00Z"])
    background_image: Optional[str] = Field(
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
            where=where_clause,
            skip=skip,
            take=limit,
            order=order_by,
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
        new_game_prisma = await db.game.create(
            data=data_to_create,
        )
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
    *,
    db: PrismaClient = Depends(DbDep),
    game_id: str,
    admin_user: AdminUser,
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
        db_game = await db.game.find_unique(
            where={"id": game_id},
        )
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


# Keep the existing sync_rawg endpoint (ensure it uses Prisma client if needed)
@router.post(
    "/sync-rawg",
    response_model=SyncResponse,  # ADDED back with local model
    dependencies=[Depends(AdminUser)],
    operation_id="GameController_syncRawg",
    summary="Sync Games from RAWG",
    description="Fetch games from the RAWG API and store them in the database. Admin access required.",
)
async def sync_rawg(
    db: PrismaClient = Depends(DbDep),
    pages: int = 1,
):
    """Fetch games from RAWG API and sync to DB."""
    try:
        sync_results = await fetch_games_from_rawg(db_session=db, pages_to_fetch=pages)
        # Ensure the return value matches the SyncResponse model
        return SyncResponse(status="Sync initiated", results=sync_results)
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"Error during RAWG sync: {str(e)}")
