from fastapi import APIRouter

# Revert to imports starting from app.
from app.api.routes.auth import router as auth_router
from app.api.routes.cart import router as cart_router
from app.api.routes.orders import router as orders_router
from app.api.routes.products import router as products_router
from app.api.routes.promotions import router as promotions_router
from app.api.routes.utils import router as utils_router

# Combine all API routers
api_router = APIRouter(prefix="/api")

# Include authentication routes
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])

# Include product/game routes
api_router.include_router(products_router, prefix="/products", tags=["Products"])

# Include user-facing promotions
api_router.include_router(promotions_router, prefix="/promotions", tags=["Promotions"])

# Include Cart routes
api_router.include_router(cart_router, prefix="/cart", tags=["Cart"])

# Include Order routes
api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])
