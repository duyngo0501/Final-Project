import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from fastapi.routing import Request as FastAPIRequest
from sqlmodel import Session

# Dependencies
from app.core.deps import SessionDep, AdminUser

# Import SessionDep instead of AdminUser if no admin actions here yet

# CRUD
# Import instantiated CRUD objects from __init__
from app.dal import game

# Models & Schemas
# Update import paths
from app.schemas.db_game import (
    GameCreateSchema,
    GamePublicSchema,
    GameListSchema,
)

# from app.schemas.db_game import GameReadSchema # Update commented import
from app.schemas.db_product import ProductListingResponse  # Update import path

# Use the new GameReadSchema for type hinting if needed, but response uses ProductListingResponse
# from app.schemas.game import GameReadSchema

# Remove unused import
# from app.services.game_api_client import get_rawg_games

router = APIRouter()

# --- Remove Placeholder Data ---
# DUMMY_PRODUCTS = [ ... ]


@router.get("/", response_model=ProductListingResponse)
def list_products(
    request: Request,
    session: SessionDep,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    # Add filtering? e.g., is_custom: bool | None = None
) -> Any:
    """
    Retrieve a list of products (games) from the local database with pagination.
    """
    skip = (page - 1) * page_size

    # Fetch games using the unified CRUD instance
    games_list = game.get_multi(db=session, skip=skip, limit=page_size)

    # Get total count
    total_count = game.get_count(db=session)

    # --- Response Formatting ---
    # Convert Game model instances to GamePublicSchema instances first
    results_as_schema = [GamePublicSchema.model_validate(g) for g in games_list]
    # Then convert schemas to dicts, ensuring UUID is stringified
    results_as_dicts = []
    for g_schema in results_as_schema:
        g_dict = g_schema.model_dump()
        g_dict["id"] = str(g_dict["id"])  # Explicitly convert UUID to string
        results_as_dicts.append(g_dict)
    # -------------------------

    # Construct next/previous URLs
    next_url = None
    if (skip + page_size) < total_count:
        next_url = str(request.url.replace_query_params(page=page + 1))
    previous_url = None
    if page > 1:
        previous_url = str(request.url.replace_query_params(page=page - 1))

    # Return using ProductListingResponse (assuming it handles List[dict])
    return ProductListingResponse(
        count=total_count,
        next=next_url,
        previous=previous_url,
        results=results_as_dicts,
    )


# --- Combined Create/Delete Endpoints ---


@router.post(
    "/",
    response_model=GamePublicSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_game_endpoint(
    *,
    session: SessionDep,
    game_in: GameCreateSchema,
    admin_user: AdminUser,
):
    """
    Create a new game (RAWG or custom - controlled by game_in.is_custom).
    Admin only.
    """
    # Check for duplicates? (e.g., existing slug or rawg_id) - depends on requirements
    # existing_game = game.get_by_slug(db=session, slug=game_in.slug)
    # if existing_game:
    #     raise HTTPException(...)
    # if not game_in.is_custom and game_in.rawg_id:
    #     existing_rawg = game.get_by_rawg_id(db=session, rawg_id=game_in.rawg_id)
    #     if existing_rawg:
    #         raise HTTPException(...)

    # Use the unified game.create method
    # Ensure game_in includes 'is_custom' flag
    try:
        new_game = game.create(db=session, obj_in=game_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return new_game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_endpoint(
    *,
    session: SessionDep,
    game_id: uuid.UUID,
    admin_user: AdminUser,
):
    """
    Delete a game by its local UUID (Admin only).
    """
    deleted_game = game.remove(db=session, id=game_id)
    if not deleted_game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    # No content returned
