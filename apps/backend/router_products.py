from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Path, Request, status
from pydantic import BaseModel, Field

# Dependencies
from deps import AdminUser, DbDep
from prisma import Client as PrismaClient

# Import Prisma errors, client and models
from prisma.errors import PrismaError, RecordNotFoundError, UniqueViolationError
from prisma.models import Category, Game, Platform

# Remove old DAL import
# from app.dal import crud_game

# --- Define Local Pydantic Models (Similar to router_games.py) ---


class PlatformItem(Platform, BaseModel):
    class Config:
        from_attributes = True


class CategoryItem(Category, BaseModel):
    class Config:
        from_attributes = True


class GameResponse(Game, BaseModel):
    platforms: list[PlatformItem] = []
    categories: list[CategoryItem] = []

    class Config:
        from_attributes = True


class GameListingResponse(BaseModel):
    items: list[GameResponse]
    total: int
    page: int
    limit: int
    pages: int


class GameCreateSchema(BaseModel):
    name: str = Field(..., examples=["Cyberpunk 2077"])
    description: str | None = Field(None, examples=["An open-world action RPG."])
    price: float | None = Field(None, examples=[59.99])
    released_date: datetime | None = Field(None, examples=["2020-12-10T00:00:00Z"])
    background_image: str | None = Field(
        None, examples=["https://example.com/image.jpg"]
    )


class SyncResponse(BaseModel):
    status: str
    results: Any


# --- Remove old Schema Imports ---
# from app.schemas.db_game import (
#     GameCreateSchema,
#     GamePublicSchema,
#     GameListingResponse,
#     GameDetailResponseSchema,
# )

# Remove unused service import (assuming moved to router_games)
# from app.services.rawg_service import fetch_games_from_rawg

router = APIRouter()


@router.get(
    "/",
    response_model=GameListingResponse,
    operation_id="ProductController_listProducts",
    summary="List Products/Games",
    description="Retrieve a list of products/games with filtering, sorting, and pagination.",
)
async def list_products(
    request: Request,
    db: PrismaClient = Depends(DbDep),
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    category: list[str] | None = None,
    platform: list[str] | None = None,
    sort_by: str | None = None,
    is_asc: bool = True,
) -> GameListingResponse:
    """
    Retrieve a list of games using Prisma client.
    Optionally filter by search term, category, platform, and sort the results.
    """
    where_clause = {}
    if search:
        where_clause["name"] = {"contains": search, "mode": "insensitive"}
    if category:
        where_clause["categories"] = {
            "some": {"name": {"in": category, "mode": "insensitive"}}
        }
    if platform:
        where_clause["platforms"] = {
            "some": {"name": {"in": platform, "mode": "insensitive"}}
        }

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

    try:
        total = await db.game.count(where=where_clause)
        items_prisma = await db.game.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            order_by=order_by,
            include={"platforms": True, "categories": True},
        )
        pages = (total + limit - 1) // limit if limit > 0 else 0

        return GameListingResponse(
            items=[GameResponse.model_validate(item) for item in items_prisma],
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
        raise HTTPException(
            status_code=500, detail=f"Internal server error fetching game list: {e}"
        )


@router.post(
    "/",
    response_model=GameResponse,
    status_code=status.HTTP_201_CREATED,
    operation_id="ProductController_createProduct",
)
async def create_product_endpoint(
    *,
    db: PrismaClient = Depends(DbDep),
    game_in: GameCreateSchema,
    admin_user: AdminUser,
) -> GameResponse:
    """
    Create a new game/product (Admin only).
    """
    try:
        data_to_create = game_in.model_dump(exclude_unset=True)
        new_game_prisma = await db.game.create(
            data=data_to_create, include={"platforms": True, "categories": True}
        )
    except UniqueViolationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product creation failed due to unique constraint: {e}",
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error creating product: {e}",
        )
    return GameResponse.model_validate(new_game_prisma)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="ProductController_deleteProduct",
)
async def delete_product_endpoint(
    *, db: PrismaClient = Depends(DbDep), product_id: str, admin_user: AdminUser
) -> None:
    """
    Delete a product/game by its ID (Admin only).
    """
    try:
        await db.game.delete(where={"id": product_id})
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error deleting product: {e}",
        )
    return None


@router.get(
    "/{product_id}",
    response_model=GameResponse,
    summary="Get Product/Game Details",
    description="Retrieve detailed information for a specific product/game by its ID.",
    operation_id="ProductController_getProduct",
)
async def get_product_details(
    product_id: str = Path(..., description="The ID of the product/game to retrieve"),
    db: PrismaClient = Depends(DbDep),
) -> GameResponse:
    """Retrieves detailed game info including platforms/categories using Prisma."""
    try:
        db_game = await db.game.find_unique(
            where={"id": product_id}, include={"platforms": True, "categories": True}
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error fetching product details: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error fetching product details: {e}",
        )

    if db_game is None:
        raise HTTPException(
            status_code=404, detail=f"Product with id {product_id} not found"
        )

    return GameResponse.model_validate(db_game)
