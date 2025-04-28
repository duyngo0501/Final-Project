import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from deps import CurrentUser, DbDep
from prisma import Prisma
from prisma.errors import PrismaError
from prisma.models import Game, Order, OrderItem

# --- Define Local Pydantic Models ---


class GameItem(Game, BaseModel):
    # Fields are inherited from prisma.models.Game
    class Config:
        from_attributes = True


class OrderItemResponse(OrderItem, BaseModel):
    # Fields like id, order_id, game_id, quantity, price_at_purchase inherited
    game: GameItem | None = None

    class Config:
        from_attributes = True


class OrderResponse(Order, BaseModel):
    # Fields like id, user_id, status, total_amount, order_date inherited
    order_items: list[OrderItemResponse] = []

    class Config:
        from_attributes = True


# --- Input Schemas ---


class OrderCreate(BaseModel):
    # Define fields expected in the request body for creating an order
    # These likely don't come directly from the user but are set server-side,
    # except maybe contact info if not tied to user profile.
    # This schema might be simplified depending on actual API contract.
    customer_email: str = Field(..., examples=["customer@example.com"])
    customer_phone: str | None = Field(None, examples=["123-456-7890"])
    # Other fields like address might be added here if needed


# --- REMOVED OLD CRUD IMPORTS ---
# from app.dal.crud_order import CRUDOrder
# from app.dal.crud_order_item import CRUDOrderItem
# from app.dal.crud_shopping_cart import CRUDShoppingCart
# from app.dal.crud_cart_entry_item import CRUDCartEntryItem

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_cart_items_for_user_prisma(
    user_id: str, db: Prisma
) -> list[dict[str, Any]]:
    """Fetches cart items and formats them for order creation using Prisma."""
    try:
        cart = await db.shoppingcart.find_unique(
            where={"user_id": user_id}, include={"items": {"include": {"game": True}}}
        )
    except PrismaError as e:
        logger.error(f"Prisma error fetching cart for user {user_id}: {e}")
        # Decide how to handle DB error here - raise HTTP 500 or return empty?
        # Returning empty for now to prevent order failure due to temp DB issue
        return []

    if not cart or not cart.items:
        return []

    # Format items similar to placeholder, getting necessary info
    formatted_items = []
    for item in cart.items:
        if item.game:  # Ensure game relationship was loaded
            formatted_items.append(
                {
                    "game_id": item.game.id,
                    "quantity": item.quantity,
                    "title": item.game.name,
                    "price": item.game.price,  # Use current game price
                }
            )
        else:
            logger.warning(
                f"Cart item {item.id} missing game relation in get_cart_items_for_user_prisma"
            )
    return formatted_items


async def clear_cart_for_user_prisma(user_id: str, db: Prisma):
    """Clears the user's cart using Prisma."""
    try:
        cart = await db.shoppingcart.find_unique(where={"user_id": user_id})

        if cart:
            await db.cart_entry.delete_many(where={"shopping_cart_id": cart.id})
            logger.info(f"Cleared cart for user {user_id}")
        else:
            logger.info(f"No cart found to clear for user {user_id}")

    except PrismaError as e:
        logger.error(f"Prisma error clearing cart for user {user_id}: {e}")
        # Don't raise HTTP exception here, as it's within an order transaction
        # Log the error; the transaction might roll back if this fails critically


def format_currency(amount: float | None) -> str:
    if amount is None:
        return "N/A"
    try:
        return f"{int(amount):,}đ".replace(",", ".")
    except (ValueError, TypeError):
        return f"{amount}đ"


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    operation_id="OrderController_createOrder",
)
async def create_order(
    order_in: OrderCreate, db: DbDep, current_user: CurrentUser
) -> OrderResponse:
    """
    Place a new order using Prisma.
    Uses a transaction to ensure atomicity of order creation and cart clearing.
    """
    logger.info(f"Received order request from email: {order_in.customer_email}")
    user_id = current_user.id
    user_name = current_user.user_metadata.get("full_name", current_user.email)

    # --- Start Transaction ---
    async with db.tx() as transaction:
        # --- 1. Fetch and Validate Cart Items --- #
        cart_items_data = await get_cart_items_for_user_prisma(user_id, transaction)
        if not cart_items_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot place order with an empty cart",
            )

        # --- 2. Calculate Total & Prepare OrderItem Data --- #
        total_amount = 0.0
        order_items_create_data = []  # For nested create
        email_items_list = []

        for index, cart_item in enumerate(cart_items_data):
            game_id = cart_item.get("game_id")
            quantity = cart_item.get("quantity")
            title = cart_item.get("title", "Unknown Item")
            price_at_purchase = cart_item.get("price")  # Using current price fetched

            if not game_id or quantity is None or price_at_purchase is None:
                logger.error(
                    f"Invalid cart item data during order creation: {cart_item}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid item data found in cart.",
                )

            # Optional: Verify game existence again within transaction if paranoid
            # game_check = await crud_game.get(db=transaction, id=game_id)
            # if not game_check:
            #    raise HTTPException(status_code=400, detail=f"Game {game_id} not found")

            item_total = price_at_purchase * quantity
            total_amount += item_total

            # Prepare data for nested create
            order_items_create_data.append(
                {
                    "game_id": game_id,
                    "quantity": quantity,
                    "price_at_purchase": price_at_purchase,
                }
            )
            email_items_list.append(
                f"{index + 1}. {title} – {format_currency(price_at_purchase)}"
            )

        # --- 3. Create Order with Nested Items --- #
        order_date = datetime.utcnow()
        try:
            new_order = await transaction.order.create(
                data={
                    "user_id": user_id,
                    "customer_email": order_in.customer_email,
                    "customer_phone": order_in.customer_phone,
                    "total_amount": total_amount,
                    "status": "processing",
                    "order_date": order_date,
                    "order_items": {
                        "create": order_items_create_data  # Nested create for items
                    },
                },
                include={
                    "order_items": {"include": {"game": True}}
                },  # Include for response
            )
        except PrismaError as e:
            logger.error(f"Prisma database error during order creation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save order due to database error.",
            )
        except Exception as e:
            logger.error(f"Unexpected error during order creation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while creating the order.",
            )

        # --- 4. Clear Cart --- #
        await clear_cart_for_user_prisma(user_id, transaction)

    # --- Transaction committed successfully --- #

    # --- 5. Generate Order ID String --- #
    order_id_str = f"#ORD{new_order.id.split('-')[0].upper()}"  # Use part of UUID

    # --- 6. Send Confirmation Email (Placeholder/Removed) --- #
    # Add email sending logic here if needed, outside the transaction
    logger.info(
        f"Order {order_id_str} ({new_order.id}) placed successfully for {order_in.customer_email}"
    )

    # --- 7. Return Response --- #
    # new_order already includes items and games due to `include` in create
    # Validate against the local Pydantic model before returning
    return OrderResponse.model_validate(new_order)


@router.get(
    "/", response_model=list[OrderResponse], operation_id="OrderController_getMyOrders"
)
async def get_my_orders(
    db: DbDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> list[OrderResponse]:
    """Retrieve the authenticated user's order history using Prisma."""
    user_id = current_user.id
    logger.info(
        f"Fetching orders for user: {user_id}, skip: {skip}, limit: {limit}, "
        f"status: {status}, start: {start_date}, end: {end_date}"
    )

    where_clause = {"user_id": user_id}
    if status:
        where_clause["status"] = status
    if start_date:
        where_clause["order_date"] = {"gte": start_date}
    if end_date:
        # Add time component or adjust logic if needed for inclusive end date
        if "order_date" in where_clause:
            # If start_date was already set, add lte to the existing dict
            where_clause["order_date"]["lte"] = end_date
        else:
            where_clause["order_date"] = {"lte": end_date}

    orders = await db.order.find_many(
        where=where_clause,
        order_by={"order_date": "desc"},
        skip=skip,
        take=limit,
        include={
            "order_items": {"include": {"game": True}}
        },  # Include details for response
    )

    # Validate each order against the local Pydantic model
    return [OrderResponse.model_validate(order) for order in orders]
