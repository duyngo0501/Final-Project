from .base import InDBBase # noqa F401
from .item import Item # noqa F401
# from .user import User # noqa F401 - Removed as per strategy
from .cart import Cart, CartItem # noqa F401
from .promotion import Promotion # noqa F401
from .custom_game import CustomGame # noqa F401

# This file makes the 'models' directory a Python package
# and allows for easier importing of models.

# Example: Import models to make them easily accessible
from .base import InDBBase as Base # Import the correct class, alias as Base if needed elsewhere
# from .user import User # Assuming you have a User model - REMOVED

# You might want to define __all__ if you prefer explicit exports
__all__ = [
    "Base", # Keep Base here if using the alias
    # "User", # REMOVED
    "Item",
    "Cart",
    "CartItem",
    "Promotion",
]
