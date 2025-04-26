# -- DEVELOPMENT NOTE --
# An admin bypass token is configured in app/api/deps.py (get_current_admin_user).
# To test admin-protected endpoints during development, set the Authorization header:
# Authorization: Bearer DEV_ADMIN_BYPASS_TOKEN
# REMOVE this bypass logic before production!
# ----------------------

import logging
from collections.abc import AsyncGenerator
from typing import Any


import uvicorn
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.config import LOGGING_CONFIG

# Alembic imports for auto-migration
from alembic import command
from alembic.config import Config

from app.routes.routers import api_router
from app.config import Settings
from app.core.middleware import TracebackMiddleware
from app.utils import custom_generate_unique_id
from app.core.db import engine
from app.services.sync_service import sync_rawg_games
from sqlmodel import Session

# Remove individual router imports
# from app.api.routes import (
#     items_router,
#     utils_router,
#     # carts_router, # Still removed
#     promotions_router,
#     products_router,
#     orders_router # Import the new orders router
# )

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
    """life span events"""
    # --- Database Session for Startup Tasks --- #
    # Use a context manager for the session
    session: Session | None = None
    try:
        with Session(engine) as session:
            logger.info("lifespan start")
            # --- Run Alembic migrations on startup --- #
            logger.info("Running database migrations...")
            alembic_cfg = Config("alembic.ini")
            alembic_cfg.set_main_option(
                "sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI
            )
            try:
                command.upgrade(alembic_cfg, "head")
                logger.info("Database migrations completed successfully.")

                # --- Run RAWG Sync (after successful migration) --- #
                logger.info("Starting RAWG sync...")
                logger.info("Attempting to call sync_rawg_games function...")
                try:
                    # WARNING: Calling synchronous function in async context
                    # Consider using run_in_threadpool or making client async
                    await sync_rawg_games(
                        session=session, pages_to_sync=1
                    )  # Use the session
                    logger.info("RAWG sync attempted.")
                except Exception as sync_exc:
                    logger.error(f"Error during RAWG sync: {sync_exc}", exc_info=True)
                # -------------------------------------------------- #

            except Exception as e:
                logger.error(f"Database migration failed: {e}", exc_info=True)
            # ------------------------------------------ #
            # logger.info("Skipping migrations and sync during this startup for debugging.") # Remove info message
            yield  # Application runs here
    finally:
        logger.info("lifespan exit")
        # Session is automatically closed by the 'with' statement


# init FastAPI with lifespan
app = FastAPI(
    lifespan=lifespan,
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Add TracebackMiddleware early in the stack
app.add_middleware(TracebackMiddleware)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Include the main aggregated router with API version prefix
app.include_router(api_router, prefix=settings.API_V1_STR)  # e.g., prefix="/api/v1"


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
        app, host="0.0.0.0", port=8000, log_config=timestamp_log_config(LOGGING_CONFIG)
    )
