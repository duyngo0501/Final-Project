from fastapi import APIRouter

from router_blogs import router as blogs_router_module
from router_cart import router as cart_router_module

# Import individual routers - Corrected paths
# Rename import
from router_games import router as games_router_module
from router_orders import router as orders_router_module

# Create a main API router
api_router = APIRouter()

# Include authentication routes

# Include product/game routes - Update module, prefix, and tag
api_router.include_router(games_router_module, prefix="/games", tags=["Games"])

# Include cart routes
api_router.include_router(cart_router_module, prefix="/cart", tags=["Cart"])

# Include order routes
api_router.include_router(orders_router_module, prefix="/orders", tags=["Orders"])

# Include blog routes
api_router.include_router(blogs_router_module, prefix="/blogs", tags=["Blogs"])
