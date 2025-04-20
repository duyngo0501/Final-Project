from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlmodel import Session  # Restored

# from supabase import Client # Removed
from app.core.auth import get_current_user
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

# Add Admin User Dependency
async def get_current_admin_user(current_user: CurrentUser) -> UserIn:
    """Dependency to check if the current user is an admin.

    Checks for admin status based on app_metadata. Requires Supabase
    to be configured to set this metadata field (e.g., 'is_admin').

    Raises:
        HTTPException (403): If the user is not an admin.

    Returns:
        The UserIn object if the user is an admin.
    """
    # Adjust the key ('is_admin') if your Supabase setup uses a different one
    is_admin = current_user.app_metadata.get("is_admin", False)
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user

AdminUser = Annotated[UserIn, Depends(get_current_admin_user)]
