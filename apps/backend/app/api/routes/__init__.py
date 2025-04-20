from .items import router as items_router
from .utils import router as utils_router
from .promotions import router as promotions_router
from .products import router as products_router
from .orders import router as orders_router

__all__ = [
    "items_router",
    "utils_router",
    "promotions_router",
    "products_router",
    "orders_router",
]
