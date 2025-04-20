from fastapi import APIRouter

# Revert to imports starting from app.
from app.api.routes.auth import router as auth_router
from app.api.routes.cart import router as cart_router
from app.api.routes.orders import router as orders_router
from app.api.routes.products import router as products_router
from app.api.routes.promotions import router as promotions_router
from app.api.routes.utils import router as utils_router

# Combine all API routers
# Revert to imports starting from app.
from app.api.routes import auth as auth_router_module
from app.api.routes import cart as cart_router_module
from app.api.routes import orders as orders_router_module
from app.api.routes import products as products_router_module
from app.api.routes import promotions as promotions_router_module
from app.api.routes import utils as utils_router_module

# Combine all API routers
# Remove prefix here as it's handled in app.main
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth_router_module.router, prefix="/auth", tags=["Auth"])

# Include product/game routes
api_router.include_router(
    products_router_module.router, prefix="/products", tags=["Products"]
)

# Include user-facing promotions
api_router.include_router(
    promotions_router_module.router, prefix="/promotions", tags=["Promotions"]
)

# Include Cart routes
api_router.include_router(cart_router_module.router, prefix="/cart", tags=["Cart"])

# Include Order routes
api_router.include_router(
    orders_router_module.router, prefix="/orders", tags=["Orders"]
)

# Missing Utils router include
api_router.include_router(utils_router_module.router, prefix="/utils", tags=["Utils"])
