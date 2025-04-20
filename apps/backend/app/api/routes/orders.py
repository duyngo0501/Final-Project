import logging
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Database Dependency
from app.core.db import get_db  # Assuming get_db is defined in app/core/db.py

# Email Utility
from app.core.email import send_order_confirmation_email

# Models
from app.models.order import Order, OrderItem  # Assuming these exist

# Schemas
from app.schemas.order import (  # Assuming these exist
    OrderCreate,
    OrderItemCreate,
    OrderResponse,
)

# Auth Dependency (Optional - adjust based on auth requirements)
# from app.auth.dependencies import get_current_user, User

logger = logging.getLogger(__name__)
router = APIRouter()


# Placeholder for cart fetching/clearing logic - Replace with actual implementation
async def get_cart_items_for_user(user_id: int, db: Session) -> list[dict]:
    # Example: Fetch from a Cart model linked to the user
    logger.warning(f"Placeholder: Fetching cart items for user {user_id}")
    # Replace with actual cart fetching logic. Return list of dicts like {'item_id': 1, 'quantity': 2}
    return [  # Dummy data
        {"item_id": 1, "quantity": 1, "title": "GTA V", "price": 250000},
        {"item_id": 2, "quantity": 1, "title": "Call of Duty", "price": 310000},
    ]


async def clear_cart_for_user(user_id: int, db: Session):
    logger.warning(f"Placeholder: Clearing cart for user {user_id}")
    # Replace with actual cart clearing logic
    pass


def format_currency(amount: float) -> str:
    # Simple Vietnamese Dong formatting - replace with a robust library if needed
    try:
        return f"{int(amount):,}đ".replace(",", ".")
    except ValueError:  # Catch specific error if amount cannot be converted to int
        # Fallback for non-integer amounts or formatting errors
        return f"{amount}đ"


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    order_in: OrderCreate,  # Input schema: expects customer_email, customer_phone, maybe items?
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user) # Uncomment if login is required
):
    """
    Place a new order.
    Receives customer info, fetches cart items (placeholder), calculates total,
    creates order and order items in DB, clears cart, and sends confirmation email.
    """
    logger.info(f"Received order request from email: {order_in.customer_email}")

    # --- 1. Identify User (if applicable) ---
    # user_id = current_user.id if current_user else None # Use if login required
    user_id = None  # Placeholder - Adapt if auth is used
    user_name = "quý khách"  # Placeholder - Get from current_user if available

    # --- 2. Fetch Cart Items (Placeholder) ---
    # This logic needs to be robust - what if user_id is None?
    # Does OrderCreate include items, or do we fetch based on user_id?
    # Assuming we fetch based on user_id for now.
    if user_id is None and not order_in.items:  # Need items if guest
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart items required for guest checkout",
        )

    cart_items_data = (
        await get_cart_items_for_user(user_id, db) if user_id else order_in.items
    )

    if not cart_items_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place order with an empty cart",
        )

    # --- 3. Calculate Total & Prepare Order Items ---
    total_amount = 0.0
    order_items_to_create: list[OrderItem] = []
    email_items_list: list[str] = []
    item_index = 1

    # It's better to fetch current prices from DB than trust cart data completely
    # For simplicity here, we use prices from the placeholder cart data
    for cart_item in cart_items_data:
        item_id = cart_item.get("item_id")
        quantity = cart_item.get("quantity")
        # Fetch Item from DB to confirm price and existence (essential step)
        # db_item = db.query(Item).filter(Item.id == item_id).first()
        # if not db_item:
        #     logger.error(f"Item with ID {item_id} not found in DB during order creation.")
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Item ID {item_id} not found.")
        # price = db_item.price # Use actual price from DB

        # Using placeholder price from cart data for now
        price = cart_item.get("price", 0)
        title = cart_item.get("title", "Unknown Item")  # Placeholder title
        if not item_id or quantity is None or price is None:
            logger.error(f"Invalid cart item data: {cart_item}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid item data in cart.",
            )

        item_total = price * quantity
        total_amount += item_total

        order_items_to_create.append(
            OrderItemCreate(
                game_id=item_id,  # Ensure game_id field name matches OrderItemCreate schema
                quantity=quantity,
                price_at_purchase=price,
            )
        )

        # Prepare item string for email
        email_items_list.append(f"{item_index}. {title} – {format_currency(price)}")
        item_index += 1

    # --- 4. Create Order Record ---
    order_date = datetime.utcnow()
    new_order = Order(
        # user_id=user_id, # Assign if available
        customer_email=order_in.customer_email,
        customer_phone=order_in.customer_phone,
        total_amount=total_amount,
        status="processing",  # Initial status
        order_date=order_date,
    )
    db.add(new_order)
    db.flush()  # Flush to get the new_order.id before creating items

    # --- 5. Create OrderItem Records ---
    for item_data in order_items_to_create:
        db_order_item = OrderItem(order_id=new_order.id, **item_data.dict())
        db.add(db_order_item)

    # --- 6. Generate Order ID String ---
    # Simple example - replace with a robust unique ID generator
    # Example: Generate a unique, harder-to-guess ID
    # order_id_str = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    # Or just use the DB ID padded
    order_id_str = f"#ORD{new_order.id:06d}"

    # --- 7. Clear Cart (Placeholder) ---
    if user_id:
        await clear_cart_for_user(user_id, db)
    # Need logic for guest carts if applicable

    # --- 8. Commit Transaction ---
    try:
        db.commit()
        db.refresh(new_order)
        # Refresh items if needed, but usually not necessary for response
    except Exception as e:
        db.rollback()
        logger.error(f"Database error during order commit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save order.",
        )

    # --- 9. Send Confirmation Email ---
    email_details = {
        "user_name": user_name,
        "order_id": order_id_str,
        "order_date": order_date.strftime("%d/%m/%Y"),  # Format date
        "total_amount_formatted": format_currency(total_amount),
        "items_list": email_items_list,
        "customer_email": order_in.customer_email,
        "customer_phone": order_in.customer_phone,
    }
    email_sent = send_order_confirmation_email(
        to_email=order_in.customer_email, order_details=email_details
    )
    if not email_sent:
        # Log error but don't fail the order placement itself maybe?
        logger.error(
            "Failed to send order confirmation email for order %s", order_id_str
        )

    # --- 10. Return Response ---
    # Need to load items for the response model if it includes them
    # Assuming OrderResponse schema can handle the ORM model directly
    logger.info(
        "Order %s placed successfully for %s", order_id_str, order_in.customer_email
    )
    return new_order  # FastAPI will convert using OrderResponse schema
