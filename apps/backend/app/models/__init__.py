"""SQLModel Modules"""

# Import all models to ensure they are registered with SQLModel metadata
# and accessible for relationships and Alembic detection.

# Remove the incorrect import for Base
# from .model_base import Base
from .model_game import Game  # Import the new Game model

# Remove imports for old GameItem and GamePromotionLink if they were replaced
# from .model_game import GameItem, GamePromotionLink
from .model_cart import CartEntryItem, ShoppingCartItem
from .model_order import Order, OrderItem
from .model_promotion import PromotionItem
from .model_user import UserItem

# Remove old base reference if not n

# Define __all__ for explicit exports
__all__ = [
    "UserItem",
    "Game",  # Ensure Game is exported
    "Order",
    "OrderItem",
    "ShoppingCartItem",
    "CartEntryItem",
    "PromotionItem",  # Ensure PromotionItem is exported
    # "CustomGame", # Remove CustomGame from export
]
