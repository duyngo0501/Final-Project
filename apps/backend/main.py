# -- DEVELOPMENT NOTE --
# An admin bypass token is configured in app/api/deps.py (get_current_admin_user).
# To test admin-protected endpoints during development, set the Authorization header:
# Authorization: Bearer DEV_ADMIN_BYPASS_TOKEN
# REMOVE this bypass logic before production!
# ----------------------

# Remove sync service import for now as it depends on engine
# from app.services.sync_service import sync_rawg_games
import logging
import traceback
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uvicorn.config import LOGGING_CONFIG

from config import Settings

# Remove old engine import
# from app.core.db import engine
# Import Prisma connection handlers
from db import connect_db, disconnect_db
from middleware import TracebackMiddleware

# Remove Alembic imports
# from alembic import command
# from alembic.config import Config
from routers import api_router

# Removed incorrect direct router imports

# Instantiate settings here for the app
settings = Settings()

logger = logging.getLogger("uvicorn")

# Print settings at startup for debugging .env loading
print("--- Loading Settings ---")
print(f"SUPABASE_URL: {settings.SUPABASE_URL}")
print(f"SUPABASE_KEY Loaded: {(settings.SUPABASE_KEY)}")  # Don't print the actual key!
print(f"API_V1_STR: {settings.API_V1_STR}")
print("-----------------------\n")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:  # noqa ARG001
    """life span events, including DB connection and background RAWG sync."""
    # Connect to DB on startup
    await connect_db()

    # --- Omit Database Migration --- #
    logger.info(
        "Skipping automatic database migrations on startup (handled by Prisma CLI)."
    )
    # Removed Alembic logic

    # --- Background RAWG Sync Task (COMMENTED OUT) --- #
    bg_task = None
    logger.info(
        "Background task for RAWG sync temporarily disabled (needs Prisma update)."
    )
    # logger.info("Creating background task for RAWG sync...")
    # Use Prisma client instance when refactoring sync_rawg_games
    # bg_task = asyncio.create_task(sync_rawg_games(engine=engine, pages_to_sync=None)) # Requires engine
    # logger.info("Background RAWG sync task created.")

    try:
        yield  # Application runs here
    finally:
        logger.info("Shutting down application...")
        if bg_task and not bg_task.done():
            logger.warning("RAWG sync task was not running or already finished.")
        # Disconnect from DB on shutdown
        await disconnect_db()
        logger.info("Application shutdown complete.")


# init FastAPI with lifespan
app = FastAPI(
    lifespan=lifespan,
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)


# Add custom exception handler for generic Exceptions
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log the full traceback
    # Use simpler call signature for format_exception
    tb_str_list = traceback.format_exception(exc)
    tb_str = "".join(tb_str_list)  # Join the list into a single string
    logger.error("Unhandled exception:", exc_info=exc)

    # Prepare response content
    content = {
        "detail": "Internal Server Error",
        "traceback": tb_str,  # Include the formatted traceback string
    }

    return JSONResponse(status_code=500, content=content)


# Add TracebackMiddleware early in the stack
# Note: The custom handler above might make this middleware redundant for logging,
# but it might provide other functionality. Review middleware.py if needed.
app.add_middleware(TracebackMiddleware)

# Set all CORS enabled origins
# Comment out the conditional check and reliance on settings
# if settings.all_cors_origins:
app.add_middleware(
    CORSMiddleware,
    # Hardcode the allowed origins list
    # allow_origins=settings.all_cors_origins,
    allow_origins=["http://localhost:5173"],  # Add other origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the main aggregated router with API version prefix
app.include_router(api_router, prefix=settings.API_V1_STR)  # e.g., prefix="/api/v1"

# Removed incorrect direct router includes


# Logger
def timestamp_log_config(uvicorn_log_config: dict[str, Any]) -> dict[str, Any]:
    """https://github.com/fastapi/fastapi/discussions/7457#discussioncomment-5565969"""
    datefmt = "%d-%m-%Y %H:%M:%S"
    formatters = uvicorn_log_config["formatters"]
    formatters["default"]["fmt"] = "%(levelprefix)s [%(asctime)s] %(message)s"
    formatters["access"][
        "fmt"
    ] = '%(levelprefix)s [%(asctime)s] %(client_addr)s - "%(request_line)s" %(status_code)s'
    formatters["access"]["datefmt"] = datefmt
    formatters["default"]["datefmt"] = datefmt
    return uvicorn_log_config


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_config=timestamp_log_config(LOGGING_CONFIG),
        log_level="debug",
    )
