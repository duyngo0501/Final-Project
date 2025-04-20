from fastapi import APIRouter

from app.api.routes.admin_promotions import router as admin_promotions_router
from app.api.routes.auth import router as auth_router
from app.api.routes.cart import router as cart_router

# Import endpoint routers directly from their modules
from app.api.routes.items import router as items_router
from app.api.routes.orders import router as orders_router
from app.api.routes.products import router as products_router
from app.api.routes.promotions import (
    router as promotions_router,  # User-facing promotions
)
from app.api.routes.utils import router as utils_router

# Remove old/conflicting imports
# from app.api.routes import items, utils
# from app.api.v1.endpoints import cart
# from app.api.v1.endpoints import promotion as user_promotion_router # User promotions
# from app.api.v1.endpoints.admin import promotion as admin_promotion_router # Admin promotions


api_router = APIRouter()

# Include endpoint routers using the consistent names from routes/__init__.py
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(items_router, prefix="/items", tags=["Items"])
api_router.include_router(utils_router, prefix="/utils", tags=["Utils"])
api_router.include_router(cart_router, prefix="/cart", tags=["Cart"])
api_router.include_router(promotions_router, prefix="/promotions", tags=["Promotions"])
api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])
api_router.include_router(
    admin_promotions_router, prefix="/admin/promotions", tags=["Admin Promotions"]
)

# Remove commented out lines for old structure
# # api_router.include_router(cart.router) # Assuming cart router needs update/inclusion
# # Still need admin promotions? If so, create admin_promotions_router in routes and include here:
# # api_router.include_router(admin_promotions_router, prefix="/admin/promotions", tags=["Admin Promotions"]) 
