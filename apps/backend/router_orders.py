import logging
from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Path
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Direct imports (assuming apps/backend is in PYTHONPATH or handled by execution context)
from config import settings
from db import get_db
from auth import get_current_user, reusable_oauth2
from db_supabase import SupabaseUser

# Imports for prisma - assuming handled by environment/installation
from prisma import Prisma
from prisma.errors import PrismaError, RecordNotFoundError
from prisma.models import Game, Order, OrderItem, ShoppingCart, CartEntry

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


class OrderSummary(BaseModel):
    id: str
    order_date: datetime
    customer_email: str
    total_amount: float
    status: str
    item_count: int

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    items: list[OrderSummary]
    total: int
    page: int
    limit: int
    skip: int


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
        # Need to find cart ID first
        cart = await db.shoppingcart.find_unique(where={"user_id": user_id})

        if cart:
            # Delete CartEntry items associated with the cart ID
            await db.cartentry.delete_many(where={"cart_id": cart.id})  # Use cart_id
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
    request: Request,
    order_in: OrderCreate,
) -> OrderResponse:
    """
    Place a new order using Prisma.
    Uses a transaction to ensure atomicity of order creation and cart clearing.
    """
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(
            status_code=e.status_code, detail=f"Token error: {e.detail}"
        )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error creating order: {e.detail}")
        raise e
    except Exception as e:
        logger.error(
            f"Unexpected error getting user for create order: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve user to create order",
        )
    # --- End Manual Fetch ---

    logger.info(f"Received order request from email: {order_in.customer_email}")
    user_id = current_user.id

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
    "/", response_model=OrderListResponse, operation_id="OrderController_listOrders"
)
async def read_orders(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of orders to skip"),
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of orders per page"
    ),
    sort_by: str = Query(
        "order_date",
        description="Field to sort by (e.g., order_date, total_amount, status)",
    ),
    sort_order: str = Query(
        "desc", pattern="^(asc|desc)$", description="Sort order: 'asc' or 'desc'"
    ),
    status: Optional[str] = Query(None, description="Filter by order status"),
    start_date: Optional[datetime] = Query(
        None, description="Filter orders placed on or after this date/time"
    ),
    end_date: Optional[datetime] = Query(
        None, description="Filter orders placed on or before this date/time"
    ),
    user_id: Optional[str] = Query(
        None, description="(Admin) Filter by specific user ID"
    ),
    customer_email: Optional[str] = Query(
        None, description="(Admin) Filter by customer email (case-insensitive)"
    ),
) -> OrderListResponse:
    """
    Retrieve a list of orders with filtering, sorting, and pagination.
    - Regular users see only their own orders.
    - Admin users (matching ADMIN_EMAIL) can see all orders and use admin-specific filters.
    """
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(
            status_code=e.status_code, detail=f"Token error: {e.detail}"
        )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error reading orders: {e.detail}")
        raise e
    except Exception as e:
        logger.error(
            f"Unexpected error getting user for read orders: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve user to read orders",
        )
    # --- End Manual Fetch ---

    # Determine if the user is an admin using settings.ADMIN_EMAIL
    is_admin = current_user.email == settings.ADMIN_EMAIL
    if is_admin:
        logger.info(f"Admin access granted for user: {current_user.email}")
    else:
        logger.info(f"Regular user access for: {current_user.email}")

    # Build WHERE clause
    where_clause = {}

    # Mandatory filter for non-admins
    if not is_admin:
        where_clause["user_id"] = current_user.id
    # Optional filter for admins if user_id query param is provided
    elif user_id:
        where_clause["user_id"] = user_id

    # Common filters (accessible to both admin and non-admin for their respective views)
    if status:
        where_clause["status"] = status
    if start_date:
        where_clause["order_date"] = {"gte": start_date}
    if end_date:
        if "order_date" in where_clause:
            where_clause["order_date"]["lte"] = end_date
        else:
            where_clause["order_date"] = {"lte": end_date}

    # Admin-only filters (customer_email)
    if is_admin and customer_email:
        where_clause["customer_email"] = {
            "contains": customer_email,
            "mode": "insensitive",
        }
    # Prevent non-admins from using admin filters (user_id already handled above)
    # This check specifically blocks customer_email for non-admins
    elif not is_admin and customer_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to filter by customer_email",
        )

    # Build ORDER BY clause
    # Map API sort fields to Prisma model fields if necessary
    sort_field_map = {
        "order_date": "order_date",
        "total_amount": "total_amount",
        "status": "status",
        "customer_email": "customer_email",
    }
    # prisma_sort_field = sort_field_map.get(
    #     sort_by, "order_date"
    # )  # Default to order_date
    # order_by_clause = [{prisma_sort_field: sort_order}]

    try:
        # Get total count based on the final where_clause
        total = await db.order.count(where=where_clause)

        # Get paginated orders with item count included
        orders_db = await db.order.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            # order_by=order_by_clause, # Re-enable order by if needed
            include={"order_items": True},  # Include items to count them
        )

        # Map to response model, calculating item count
        order_summaries = [
            OrderSummary(
                id=o.id,
                order_date=o.order_date,
                customer_email=o.customer_email,
                total_amount=o.total_amount,
                status=o.status,
                item_count=(
                    len(o.order_items) if o.order_items else 0
                ),  # Calculate count
            )
            for o in orders_db
        ]

    except PrismaError as e:
        # Log the detailed error for debugging
        logger.error(f"Database error fetching orders: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching orders.",
        )

    # Calculate current page number
    page = (skip // limit) + 1

    return OrderListResponse(
        items=order_summaries,
        total=total,
        page=page,
        limit=limit,
        skip=skip,
    )

# --- NEW ENDPOINT: Get Order Details --- #
@router.get(
    "/{order_id}",
    response_model=OrderResponse, # Use the detailed response model
    operation_id="OrderController_getOrderDetails",
    summary="Get Order Details by ID",
    description="Retrieve detailed information for a specific order, including line items and games.",
)
async def read_order_details(
    request: Request,
    order_id: str = Path(..., description="The ID of the order to retrieve"),
) -> OrderResponse:
    """Fetches a single order by its ID, ensuring user ownership.
    
    Includes nested order items and their associated game details.
    """
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error fetching order {order_id}: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        
    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error fetching order {order_id}: {e.detail}")
        raise e 
    except Exception as e:
        logger.error(f"Unexpected error getting user for order {order_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user to fetch order")
    # --- End Manual Fetch ---

    try:
        order = await db.order.find_first(
            where={
                "id": order_id,
                "user_id": current_user.id # Ensure the user owns the order
            },
            include={
                "order_items": {
                    "include": {
                        "game": True # Include game details for each item
                    }
                }
            }
        )

        if not order:
            # Check if the user is an admin, if so, allow fetching any order
            # (Optional: Add admin check logic here if needed)
            # is_admin = getattr(current_user, 'app_metadata', {}).get("claims_admin") is True
            # if is_admin:
            #     order = await db.order.find_unique(...) # Fetch without user_id constraint
            # if not order: # If still not found even for admin
            #    raise HTTPException(status_code=404, detail=f"Order with id {order_id} not found")
            # else: # Order found, but doesn't belong to the requesting user (if not admin)
            raise HTTPException(status_code=404, detail=f"Order with id {order_id} not found or access denied")

    except RecordNotFoundError: # Should be caught by find_first returning None, but good practice
         logger.warning(f"Order {order_id} not found for user {current_user.id}")
         raise HTTPException(status_code=404, detail=f"Order with id {order_id} not found")
    except PrismaError as e:
        logger.error(f"Database error fetching order {order_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while fetching order details.")
    except Exception as e:
        logger.error(f"Unexpected error fetching order {order_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected server error occurred.")

    # Validate against the detailed Pydantic model
    return OrderResponse.model_validate(order)
