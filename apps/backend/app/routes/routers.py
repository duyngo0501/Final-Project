from fastapi import APIRouter

# Import individual routers

# Rename import
from app.routes import router_games as games_router_module
from app.routes import router_cart as cart_router_module
from app.routes import router_orders as orders_router_module
from app.routes import router_blogs as blogs_router_module

# Create a main API router
api_router = APIRouter()

# Include authentication routes

# Include product/game routes - Update module, prefix, and tag
api_router.include_router(games_router_module.router, prefix="/games", tags=["Games"])

# Include cart routes
api_router.include_router(cart_router_module.router, prefix="/cart", tags=["Cart"])

# Include order routes
api_router.include_router(
    orders_router_module.router, prefix="/orders", tags=["Orders"]
)

# Include blog routes
api_router.include_router(blogs_router_module.router, prefix="/blogs", tags=["Blogs"])
