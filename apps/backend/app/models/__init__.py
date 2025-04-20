# Import all SQLModels to make them available when importing from 'app.models'
from .cart import CartEntryItem, ShoppingCartItem
from .custom_game import CustomGame
from .game import GameItem, GamePromotionLink
from .order import Order, OrderItem
from .promotion import PromotionItem
from .user import UserItem

# Remove old base reference if not needed
# from .base import InDBBase  # noqa F401

# Define __all__ for explicit exports
__all__ = [
    "UserItem",
    "GameItem",
    "Order",
    "OrderItem",
    "ShoppingCartItem",
    "CartEntryItem",
    "PromotionItem",
    "CustomGame",
]
