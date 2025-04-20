from fastapi import APIRouter

# Import endpoint routers
from app.api.routes import items, utils
from app.api.v1.endpoints import cart
from app.api.v1.endpoints import promotion as user_promotion_router # User promotions
from app.api.v1.endpoints.admin import promotion as admin_promotion_router # Admin promotions


api_router = APIRouter()

# Include endpoint routers
api_router.include_router(items.router)
api_router.include_router(utils.router)
api_router.include_router(cart.router)
api_router.include_router(
    user_promotion_router.router, prefix="/promotions", tags=["promotions"]
) # User access at /api/v1/promotions/
api_router.include_router(
    admin_promotion_router.router, prefix="/admin/promotions", tags=["admin-promotions"]
) # Admin access at /api/v1/admin/promotions/
