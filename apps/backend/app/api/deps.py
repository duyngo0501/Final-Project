import uuid  # Import uuid for dummy user
from datetime import datetime
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session  # Restored

# from supabase import Client # Removed
from app.core.auth import SuperClient, TokenDep, get_current_user
from app.core.db import get_db  # Restored

# from app.core.supabase_client import supabase_client # Removed
from app.schemas.auth import UserIn

CurrentUser = Annotated[UserIn, Depends(get_current_user)]

# Restore SessionDep
SessionDep = Annotated[Session, Depends(get_db)]

# Removed SupabaseDep
# def get_supabase_client() -> Client:
#     return supabase_client
# SupabaseDep = Annotated[Client, Depends(get_supabase_client)]


# Define the bypass token
DEV_ADMIN_BYPASS_TOKEN = "DEV_ADMIN_BYPASS_TOKEN"


# Add Admin User Dependency
async def get_current_admin_user(
    request: Request,  # Inject Request to access headers
    token: TokenDep,  # Inject TokenDep dependency
    super_client: SuperClient,  # Inject SuperClient dependency
) -> UserIn:
    """Dependency to get the current admin user.

    Checks for a special development bypass token first.
    If not found, gets the regular current user and checks for admin status
    based on app_metadata ('is_admin').

    Raises:
        HTTPException (403): If the user is not an admin or auth fails.
        HTTPException (401): If auth header is missing/invalid (without bypass).

    Returns:
        The UserIn object if the user is an admin or bypass token is used.
    """
    auth_header = request.headers.get("Authorization")

    # --- DEVELOPMENT ONLY BYPASS ---
    # WARNING: Remove this block before deploying to production!
    if auth_header == f"Bearer {DEV_ADMIN_BYPASS_TOKEN}":
        print("\n--- WARNING: Using DEVELOPMENT ADMIN BYPASS ---\n")
        # Return a dummy admin user object
        # Adjust fields based on the actual UserIn schema if needed
        return UserIn(
            id=str(uuid.uuid4()),  # Dummy ID
            aud="authenticated",  # Dummy value
            role="authenticated",  # Dummy value
            email=f"dev_admin_{uuid.uuid4().hex[:4]}@example.com",  # Dummy email
            app_metadata={"is_admin": True},  # Crucial part: set admin flag
            user_metadata={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
    # --- END DEVELOPMENT ONLY BYPASS ---

    # If no bypass token, proceed with normal authentication and check
    try:
        # Call get_current_user with the correct injected dependencies
        current_user = await get_current_user(token=token, super_client=super_client)
    except HTTPException as e:
        # Re-raise auth exceptions (e.g., 401 Unauthorized) from get_current_user
        raise e

    # Original check for admin status
    is_admin = current_user.app_metadata.get("is_admin", False)
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


AdminUser = Annotated[UserIn, Depends(get_current_admin_user)]
