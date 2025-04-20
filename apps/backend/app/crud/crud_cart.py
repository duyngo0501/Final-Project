import uuid

from sqlmodel import Session, select

# Revert to imports starting from app.
from app.crud.base import CRUDBase
from app.models.cart import ShoppingCartItem, CartEntryItem
from app.schemas.cart import (
    CartCreateSchema,
    CartItemCreateSchema,
    CartItemUpdateSchema,
    CartUpdateSchema,
    CartResponseSchema,
)


class CRUDCart(CRUDBase[ShoppingCartItem, CartCreateSchema, CartUpdateSchema]):
    """CRUD operations for Cart model."""

    def get_by_owner(
        self, session: Session, *, owner_id: uuid.UUID
    ) -> ShoppingCartItem | None:
        """Gets the cart for a specific owner.

        Args:
            session: The database session.
            owner_id: The UUID of the cart owner.

        Returns:
            The Cart object if found, otherwise None.
        """
        statement = select(self.model).where(self.model.owner_id == owner_id)
        return session.exec(statement).first()

    def get_or_create(
        self, session: Session, *, owner_id: uuid.UUID
    ) -> ShoppingCartItem:
        """Gets the cart for an owner, creating one if it doesn't exist.

        Args:
            session: The database session.
            owner_id: The UUID of the cart owner.

        Returns:
            The existing or newly created Cart object.
        """
        cart = self.get_by_owner(session, owner_id=owner_id)
        if not cart:
            # Create CartCreate schema instance (empty in this case)
            cart_in = CartCreateSchema()
            # Use CRUDBase create method
            cart = self.create(session, owner_id=owner_id, obj_in=cart_in)
        return cart


class CRUDCartItem(CRUDBase[CartEntryItem, CartItemCreateSchema, CartItemUpdateSchema]):
    """CRUD operations for CartItem model."""

    def get_by_cart_and_product(
        self, session: Session, *, cart_id: uuid.UUID, product_id: uuid.UUID
    ) -> CartEntryItem | None:
        """Gets a specific item within a specific cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart.
            product_id: The UUID of the product.

        Returns:
            The CartItem object if found, otherwise None.
        """
        statement = select(self.model).where(
            self.model.cart_id == cart_id, self.model.product_id == product_id
        )
        return session.exec(statement).first()

    def add_item(
        self, session: Session, *, cart_id: uuid.UUID, item_in: CartItemCreateSchema
    ) -> CartEntryItem:
        """Adds an item to the cart or updates quantity if it already exists.

        Args:
            session: The database session.
            cart_id: The UUID of the cart to add the item to.
            item_in: The schema containing product_id and quantity.

        Returns:
            The created or updated CartItem object.
        """
        existing_item = self.get_by_cart_and_product(
            session, cart_id=cart_id, product_id=item_in.product_id
        )
        if existing_item:
            existing_item.quantity += item_in.quantity
            session.add(existing_item)
            session.commit()
            session.refresh(existing_item)
            return existing_item
        else:
            # Create the new item
            db_obj = self.model(cart_id=cart_id, **item_in.model_dump())
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
            return db_obj

    def update_item_quantity(
        self,
        session: Session,
        *,
        cart_id: uuid.UUID,
        product_id: uuid.UUID,
        item_in: CartItemUpdateSchema,
    ) -> CartEntryItem | None:
        """Updates the quantity of a specific item in a cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart.
            product_id: The UUID of the product whose quantity needs updating.
            item_in: The schema containing the new quantity.

        Returns:
            The updated CartItem object, or None if the item wasn't found.
        """
        db_obj = self.get_by_cart_and_product(
            session, cart_id=cart_id, product_id=product_id
        )
        if db_obj:
            db_obj.quantity = item_in.quantity
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
        return db_obj

    def remove_item(
        self, session: Session, *, cart_id: uuid.UUID, product_id: uuid.UUID
    ) -> CartEntryItem | None:
        """Removes a specific item from a cart.

        Args:
            session: The database session.
            cart_id: The UUID of the cart.
            product_id: The UUID of the product to remove.

        Returns:
            The removed CartItem object, or None if it wasn't found.
        """
        obj = self.get_by_cart_and_product(
            session, cart_id=cart_id, product_id=product_id
        )
        if obj:
            session.delete(obj)
            session.commit()
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
            session.commit()
        return count


# Instantiate CRUD objects
cart = CRUDCart(ShoppingCartItem)
cart_item = CRUDCartItem(CartEntryItem)
