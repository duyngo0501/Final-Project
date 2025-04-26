import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, SessionDep
from app.dal import shopping_cart, cart_entry_item
from app.schemas.db_cart import (
    CartItemCreateSchema,
    CartItemResponseSchema,
    CartItemUpdateSchema,
    CartResponseSchema,
)

router = APIRouter()


@router.get("/", response_model=CartResponseSchema)
async def read_cart(
    session: SessionDep, current_user: CurrentUser
) -> CartResponseSchema:
    """Retrieve the current user's shopping cart.

    Retrieves the cart associated with the authenticated user.
    If no cart exists, a new empty cart is created and returned.

    Args:
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The user's cart.
    """
    user_id = uuid.UUID(current_user.id)  # Ensure user ID is UUID
    cart = shopping_cart.get_or_create(session, owner_id=user_id)
    # Eagerly load items if necessary (SQLModel might do this automatically based on schema)
    # For explicit loading with SQLAlchemy (if SQLModel doesn't cover it):
    # options = select(Cart).options(selectinload(Cart.items))
    # statement = options.where(Cart.owner_id == user_id)
    # cart = session.exec(statement).first()
    # if not cart: ... create ...
    return cart


@router.post(
    "/items", response_model=CartItemResponseSchema, status_code=status.HTTP_201_CREATED
)
async def add_item_to_cart(
    item_in: CartItemCreateSchema, session: SessionDep, current_user: CurrentUser
) -> CartItemResponseSchema:
    """Add an item to the shopping cart.

    Adds a product with a specified quantity to the user's cart.
    If the product already exists in the cart, its quantity is increased.
    A cart is created for the user if one doesn't exist.

    Args:
        item_in: The cart item details (product_id, quantity).
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The created or updated cart item.
    """
    user_id = uuid.UUID(current_user.id)
    user_cart = shopping_cart.get_or_create(session, owner_id=user_id)

    # TODO: Add check here to ensure product_id exists in your Product table
    # product = crud_product.get(session, id=item_in.product_id)
    # if not product:
    #     raise HTTPException(status_code=404, detail="Product not found")

    cart_item = cart_entry_item.add_item(session, cart_id=user_cart.id, item_in=item_in)
    return cart_item


@router.put("/items/{product_id}", response_model=CartItemResponseSchema)
async def update_cart_item_quantity(
    product_id: uuid.UUID,
    item_in: CartItemUpdateSchema,
    session: SessionDep,
    current_user: CurrentUser,
) -> CartItemResponseSchema:
    """Update the quantity of an item in the cart.

    Sets the quantity for a specific product in the user's cart.

    Args:
        product_id: The UUID of the product to update.
        item_in: The new quantity details.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The updated cart item.

    Raises:
        HTTPException (404): If the cart or item is not found.
    """
    user_id = uuid.UUID(current_user.id)
    user_cart = shopping_cart.get_by_owner(session, owner_id=user_id)
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    updated_item = cart_entry_item.update_item_quantity(
        session, cart_id=user_cart.id, product_id=product_id, item_in=item_in
    )
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return updated_item


@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_cart(
    product_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> None:
    """Remove an item from the shopping cart.

    Deletes a specific product from the user's cart.

    Args:
        product_id: The UUID of the product to remove.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        None. Returns 204 No Content on success.

    Raises:
        HTTPException (404): If the cart or item is not found.
    """
    user_id = uuid.UUID(current_user.id)
    user_cart = shopping_cart.get_by_owner(session, owner_id=user_id)
    if not user_cart:
        # Or just return 204 if removing from non-existent cart is okay
        raise HTTPException(status_code=404, detail="Cart not found")

    removed_item = cart_entry_item.remove_item(
        session, cart_id=user_cart.id, product_id=product_id
    )
    if not removed_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # No content to return on successful deletion
    return None


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(session: SessionDep, current_user: CurrentUser) -> None:
    """Clear all items from the shopping cart.

    Removes all items associated with the user's cart.

    Args:
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        None. Returns 204 No Content on success.

    Raises:
        HTTPException (404): If the cart is not found.
    """
    user_id = uuid.UUID(current_user.id)
    user_cart = shopping_cart.get_by_owner(session, owner_id=user_id)
    if not user_cart:
        # Or just return 204 if clearing non-existent cart is okay
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_entry_item.clear_cart(session, cart_id=user_cart.id)

    # No content to return on successful deletion
    return None
