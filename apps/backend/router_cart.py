import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field  # Import BaseModel and Field

from db import get_db
from auth import get_current_user, reusable_oauth2
from db_supabase import SupabaseUser
from prisma import Prisma  # Import Prisma

# Import Prisma errors for specific handling
from prisma.errors import PrismaError, RecordNotFoundError

# Import Prisma Models for inheritance and type hints
from prisma.models import CartEntry, Game, ShoppingCart

# --- Define Local Pydantic Models ---


class GameItem(Game, BaseModel):  # Inherit from Prisma Game
    # Fields are inherited from prisma.models.Game
    class Config:
        from_attributes = True


class CartItemResponse(CartEntry, BaseModel):  # Inherit from Prisma CartEntry
    # Fields like id, shopping_cart_id, game_id, quantity are inherited
    game: GameItem | None = None  # Explicitly define the relation type

    class Config:
        from_attributes = True


class CartResponse(ShoppingCart, BaseModel):  # Inherit from Prisma ShoppingCart
    # Fields like id, user_id, created_at, updated_at are inherited
    items: list[CartItemResponse] = []  # Explicitly define the relation type

    class Config:
        from_attributes = True


# --- Input Schemas (Do not inherit from Prisma models) ---


class CartItemCreate(BaseModel):
    game_id: str = Field(..., examples=["some-game-uuid"])
    quantity: int = Field(..., gt=0, examples=[1])  # Ensure quantity is positive


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., examples=[2])


# --- REMOVE OLD SCHEMA IMPORT ---
# from app.schemas.db_cart import (
#     CartItemCreateSchema,
#     CartItemResponseSchema,
#     CartItemUpdateSchema,
#     CartResponseSchema,
# )

# Define logger
logger = logging.getLogger(__name__)

router = APIRouter()


# Helper function to get or create cart using Prisma
async def get_or_create_cart_prisma(
    db: Prisma, user_id: str, include_items: bool = False
) -> ShoppingCart:  # Return type hint Prisma ShoppingCart
    include_clause = None
    if include_items:
        include_clause = {"items": {"include": {"game": True}}}

    cart = await db.shoppingcart.find_unique(
        where={"user_id": user_id}, include=include_clause
    )
    if not cart:
        cart = await db.shoppingcart.create(
            data={"user_id": user_id}, include=include_clause
        )
    return cart


@router.get("/", response_model=CartResponse, operation_id="CartController_getCart")
async def read_cart(
    request: Request,
) -> CartResponse:  # Update return type hint
    """Retrieve the current user's shopping cart using Prisma.

    Retrieves the cart associated with the authenticated user, including item details
    and associated game information using Prisma's include. If no cart exists,
    a new empty cart is created.
    """
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error getting user for cart: {e.detail}")
        raise e 
    except Exception as e:
        logger.error(f"Unexpected error getting user for cart: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user for cart")
    # --- End Manual Fetch ---
    
    user_id = current_user.id
    logger.info(f"Attempting to retrieve cart for user_id: {user_id}")

    try:
        # --- USE PRISMA DIRECTLY via helper ---
        cart_prisma = await get_or_create_cart_prisma(
            db=db, user_id=user_id, include_items=True
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error getting cart: {e}",
        )

    # Validate and return using the local Pydantic model
    return CartResponse.model_validate(cart_prisma)


@router.post(
    "/items",
    response_model=CartItemResponse,  # Update response model
    status_code=status.HTTP_201_CREATED,
    operation_id="CartController_addItem",
)
async def add_item_to_cart(
    request: Request,
    item_in: CartItemCreate,
) -> CartItemResponse:  # Update return type hint
    """Add an item to the shopping cart using Prisma.

    Adds a product with a specified quantity to the user's cart.
    Uses Prisma upsert logic (find or create/update) to handle item quantity.
    A cart is created for the user if one doesn't exist.
    """
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        
    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error adding item: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting user for add item: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user to add item")
    # --- End Manual Fetch ---

    user_id = current_user.id
    game_id = item_in.game_id
    quantity = item_in.quantity

    # Input validation (quantity > 0) is now handled by CartItemCreate Pydantic model
    # if quantity <= 0:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Quantity must be positive",
    #     )

    try:
        # Verify the game exists before adding using Prisma
        game_exists = await db.game.find_unique(where={"id": game_id})
        if not game_exists:
            raise HTTPException(status_code=404, detail="Game not found")

        # Get or create the user's cart
        user_cart = await get_or_create_cart_prisma(db=db, user_id=user_id)

        # Find existing item first approach:
        existing_item = await db.cartentry.find_first(
            where={"cart_id": user_cart.id, "game_id": game_id}
        )

        if existing_item:
            # Update quantity
            cart_item_prisma = await db.cartentry.update(
                where={"id": existing_item.id},
                data={"quantity": existing_item.quantity + quantity},
                include={"game": True},  # Include game for response
            )
        else:
            # Create new item
            cart_entry_data = {
                "game_id": game_id,
                "cart_id": user_cart.id,
                "quantity": quantity,
            }
            cart_item_prisma = await db.cartentry.create(data=cart_entry_data)

    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error adding item to cart: {e}",
        )

    # Validate and return using the local Pydantic model
    return CartItemResponse.model_validate(cart_item_prisma)


@router.put(
    "/items/{game_id}",
    response_model=CartItemResponse,  # Update response model
    operation_id="CartController_updateItemQuantity",
)
async def update_cart_item_quantity(
    request: Request,
    game_id: str,
    item_in: CartItemUpdate,  # Update input type hint
) -> CartItemResponse:  # Update return type hint
    """Update the quantity of an item in the cart using Prisma.
    If quantity becomes 0 or less, the item is removed.
    """
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        
    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error updating item: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting user for update item: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user to update item")
    # --- End Manual Fetch ---

    user_id = current_user.id
    new_quantity = item_in.quantity

    # Input validation (quantity > 0) should ideally be in CartItemUpdate, if needed.
    # Or handle here if 0 is allowed for deletion logic
    if new_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be positive. Use DELETE to remove items.",
        )

    try:
        # Find the user's cart
        user_cart = await db.shoppingcart.find_unique(where={"user_id": user_id})
        if not user_cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        # Find the specific item
        item_to_update = await db.cartentry.find_first(
            where={"cart_id": user_cart.id, "game_id": game_id}
        )

        if not item_to_update:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        # Update the quantity
        updated_item_prisma = await db.cartentry.update(
            where={"id": item_to_update.id},
            data={"quantity": new_quantity},
            include={"game": True},  # Include game for response
        )
        # Validate and return using the local Pydantic model
        return CartItemResponse.model_validate(updated_item_prisma)

    except RecordNotFoundError:  # Catch potential delete error if item vanishes
        raise HTTPException(status_code=404, detail="Item not found in cart")
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error updating cart item: {e}",
        )


@router.delete(
    "/items/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="CartController_removeItem",
)
async def remove_item_from_cart(
    request: Request,
    game_id: str,
) -> None:
    """Remove an item from the shopping cart using Prisma."""
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error removing item: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting user for remove item: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user to remove item")
    # --- End Manual Fetch ---
    
    user_id = current_user.id
    logger.info(f"Removing game_id: {game_id} from cart for user_id: {user_id}")

    try:
        # Find the user's cart first
        user_cart = await db.shoppingcart.find_unique(where={"user_id": user_id})
        if not user_cart:
            # If cart doesn't exist, item definitely doesn't exist
            raise HTTPException(status_code=404, detail="Item not found in cart")

        # Find the item within the user's cart
        item_to_delete = await db.cartentry.find_first(
            where={"cart_id": user_cart.id, "game_id": game_id}
        )

        if not item_to_delete:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        # Delete the specific cart entry using its unique ID
        await db.cartentry.delete(where={"id": item_to_delete.id})

    except (
        RecordNotFoundError
    ):  # Catch potential error if item deleted between find and delete
        # Technically, the item is already gone, so 204 is still appropriate.
        # Or raise 404 if strict confirmation is needed.
        pass  # Successfully deleted or already gone
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error removing item from cart: {e}",
        )

    # Return None for 204 No Content response
    return None


@router.delete(
    "/", status_code=status.HTTP_204_NO_CONTENT, operation_id="CartController_clearCart"
)
async def clear_cart(
    request: Request,
) -> None:
    """Clear all items from the user's shopping cart using Prisma."""
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error clearing cart: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting user for clear cart: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user to clear cart")
    # --- End Manual Fetch ---
    
    user_id = current_user.id
    logger.info(f"Clearing cart for user_id: {user_id}")

    try:
        # Find the user's cart
        user_cart = await db.shoppingcart.find_unique(where={"user_id": user_id})

        if user_cart:
            # Delete all cart entries associated with this cart_id
            await db.cartentry.delete_many(where={"cart_id": user_cart.id})

    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error clearing cart: {e}",
        )

    # Return None for 204 No Content response
    return None
