"""CRUD Module Entry Point

Instantiates singleton CRUD objects for use throughout the application,
primarily injected as dependencies into API routes.
"""

# Import CRUD classes
from .crud_shopping_cart import CRUDShoppingCart
from .crud_cart_entry_item import CRUDCartEntryItem
from .crud_game import CRUDGame
from .crud_promotion import CRUDPromotion
from .crud_user import CRUDUser

# Import models needed for instantiation
from app.models.model_cart import ShoppingCartItem, CartEntryItem
from app.models.model_promotion import PromotionItem
from app.models.model_user import UserItem

# Instantiate CRUD objects
shopping_cart = CRUDShoppingCart(model=ShoppingCartItem)
cart_entry_item = CRUDCartEntryItem(model=CartEntryItem)
game = CRUDGame()
promotion = CRUDPromotion(model=PromotionItem)
user = CRUDUser()

# Define __all__ for explicit exports (optional but good practice)
__all__ = [
    "shopping_cart",
    "cart_entry_item",
    "game",
    "promotion",
    "user",
]
