"""CRUD operations for the CartEntryItem model."""

import uuid

from sqlmodel import Session, select

# Revert to imports starting from app.
from app.dal.crud_base import CRUDBase
from app.models.model_cart import CartEntryItem
from app.schemas.db_cart import (
    CartItemCreateSchema,
    CartItemResponseSchema,  # Ensure this schema is defined or remove if not used
    CartItemUpdateSchema,
)


# Renamed class to match potential filename
class CRUDCartEntryItem(
    CRUDBase[CartEntryItem, CartItemCreateSchema, CartItemUpdateSchema]
):
    """CRUD operations for CartEntryItem model."""

    def get_by_cart_and_product(
        self, session: Session, *, cart_id: uuid.UUID, game_id: uuid.UUID
    ) -> CartEntryItem | None:
        """Gets a specific item within a specific cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart.
            game_id: The UUID of the game (product).

        Returns:
            The CartEntryItem object if found, otherwise None.
        """
        statement = select(self.model).where(
            self.model.cart_id == cart_id, self.model.game_id == game_id
        )
        # Prevent autoflush when just checking for existence
        with session.no_autoflush:
            result = session.exec(statement).first()
        return result  # Return the result obtained within the block

    def add_item(
        self, session: Session, *, cart_id: uuid.UUID, item_in: CartItemCreateSchema
    ) -> CartEntryItem:
        """Adds an item to the cart or updates quantity if it already exists.

        Args:
            session: The database session.
            cart_id: The UUID of the cart to add the item to.
            item_in: The schema containing product_id and quantity.

        Returns:
            The created or updated CartEntryItem object.
        """
        existing_item = self.get_by_cart_and_product(
            session, cart_id=cart_id, game_id=item_in.game_id
        )
        if existing_item:
            existing_item.quantity += item_in.quantity
            session.add(existing_item)
            return existing_item
        else:
            db_obj = self.model(
                cart_id=cart_id, game_id=item_in.game_id, quantity=item_in.quantity
            )
            session.add(db_obj)
            return db_obj

    def update_item_quantity(
        self,
        session: Session,
        *,
        cart_id: uuid.UUID,
        game_id: uuid.UUID,
        item_in: CartItemUpdateSchema,
    ) -> CartEntryItem | None:
        """Updates the quantity of a specific item in a cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart.
            game_id: The UUID of the game (product) whose quantity needs updating.
            item_in: The schema containing the new quantity.

        Returns:
            The updated CartEntryItem object, or None if the item wasn't found.
        """
        db_obj = self.get_by_cart_and_product(session, cart_id=cart_id, game_id=game_id)
        if db_obj:
            db_obj.quantity = item_in.quantity
            session.add(db_obj)
        return db_obj

    def remove_item(
        self, session: Session, *, cart_id: uuid.UUID, game_id: uuid.UUID
    ) -> CartEntryItem | None:
        """Removes a specific item from a cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart.
            game_id: The UUID of the game (product) to remove.

        Returns:
            The removed CartEntryItem object, or None if it wasn't found.
        """
        obj = self.get_by_cart_and_product(session, cart_id=cart_id, game_id=game_id)
        if obj:
            session.delete(obj)
        return obj

    def clear_cart(self, session: Session, *, cart_id: uuid.UUID) -> int:
        """Removes all items from a specific cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart to clear.

        Returns:
            The number of items deleted.
        """
        statement = select(self.model).where(self.model.cart_id == cart_id)
        items_to_delete = session.exec(statement).all()
        count = len(items_to_delete)
        if count > 0:
            for item in items_to_delete:
                session.delete(item)
        return count


# Instance creation removed
# cart_item = CRUDCartEntryItem(CartEntryItem)
