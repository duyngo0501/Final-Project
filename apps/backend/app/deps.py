"""Shared FastAPI Dependencies"""

from collections.abc import Generator
from typing import Annotated
import os

from fastapi import Depends, HTTPException, status, Request

# Remove SQLModel Session import
# from sqlmodel import Session
# Import Prisma
from prisma import Prisma

from .auth import get_current_user
from app.schemas.db_supabase import SupabaseUser

# Remove old engine import
# from .db import engine
# Import the new get_db function from app.core.db
from .db import (
    get_db as get_prisma_db,
)  # Rename to avoid potential name clash if old get_db was used elsewhere

# Import settings to access ADMIN_EMAIL (Keep if still needed)
from app.config import settings

# Use rich print for logging (Keep if still needed)
from rich import print

# Dependency type hint for Prisma client instance
# Rename SessionDep to DbDep or PrismaDep for clarity
DbDep = Annotated[Prisma, Depends(get_prisma_db)]

# Dependency type hint for the current user (obtained from token)
CurrentUser = Annotated[SupabaseUser, Depends(get_current_user)]


async def get_current_admin_user(
    current_user: CurrentUser, request: Request
) -> SupabaseUser:
    """Dependency to get the current user and verify they have admin claims.

    Checks the authenticated user's app_metadata for admin claims.
    Allows bypassing auth via X-Bypass-Token header if ENABLE_AUTH_BYPASS is true.

    Raises:
        HTTPException (403): If the user does not have admin claims (and bypass is not active).

    Returns:
        SupabaseUser: The user object if they have admin claims or bypass is active.
    """
    # Bypass logic
    enable_bypass = os.getenv("ENABLE_AUTH_BYPASS") == "true"
    bypass_token_header = request.headers.get("X-Bypass-Token")
    correct_bypass_token = os.getenv("AUTH_BYPASS_TOKEN")

    if (
        enable_bypass
        and bypass_token_header
        and bypass_token_header == correct_bypass_token
    ):
        print(
            f"[bold yellow]Auth Bypass Activated via Token for:[/bold yellow] {current_user.email}"
        )
        # Return the user object directly, skipping admin check
        # Note: This user might *not* actually be an admin, but access is granted for testing
        return current_user
    # End bypass logic

    # Update admin check logic
    # Check for 'claims_admin' in app_metadata (adjust key if necessary)
    if not current_user.app_metadata.get("claims_admin") is True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    # Add a print statement for verification during testing
    print(f"[bold green]Admin access granted for:[/bold green] {current_user.email}")
    return current_user


# Dependency type hint for an admin user
# Note: Depends() needs to implicitly get the Request object if needed by get_current_admin_user
# AdminUser = Annotated[SupabaseUser, Depends(get_current_admin_user)]
