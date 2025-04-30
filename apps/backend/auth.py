"""Core authentication setup using Supabase.

Provides dependencies and utilities for handling authentication via Supabase,
including client creation and user validation from JWT tokens.
"""

import logging
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from config import settings
from db_supabase import SupabaseUser
from supabase import AsyncClientOptions
from supabase._async.client import AsyncClient, create_client


async def get_super_client() -> AsyncClient:
    """Creates and returns an authenticated Supabase admin client.

    Uses SUPABASE_URL and SUPABASE_KEY (service role) from settings.
    Intended for server-side operations requiring elevated privileges.

    Returns:
        An initialized asynchronous Supabase client.

    Raises:
        HTTPException: If the Supabase client fails to initialize (status 500).
    """
    try:
        super_client = await create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,  # Expects service_role key
            options=AsyncClientOptions(
                postgrest_client_timeout=10, storage_client_timeout=10
            ),
        )
        if not super_client:
            raise ValueError("Supabase client creation returned None")
        return super_client
    except Exception as e:
        logging.error(
            f"Detailed error initializing Supabase client: {type(e).__name__} - {repr(e)}"
        )
        logging.error(f"Failed to initialize Supabase super client: {e}")
        raise HTTPException(
            status_code=500, detail="Supabase admin client could not be initialized"
        )

# This dependency type hint might still be useful internally or in other parts of the app
SuperClient = Annotated[AsyncClient, Depends(get_super_client)]


# OAuth2 Password Bearer scheme for extracting tokens from Authorization header.
# This part remains the same, routers will call it manually
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False # Set auto_error=False so it returns None if header is missing, allowing manual handling
)


# Modified get_current_user
async def get_current_user(token: str) -> SupabaseUser:
    """Validates a JWT and retrieves the current user by creating its own Supabase client.

    Args:
        token: The JWT token extracted manually (e.g., via reusable_oauth2).

    Returns:
        SupabaseUser: A Pydantic model containing the validated user's details.

    Raises:
        HTTPException (401): If the token is invalid, expired, or fails validation.
        HTTPException (500): If the Supabase client fails or other unexpected errors occur.
    """
    super_client: AsyncClient | None = None
    try:
        # Create the super_client internally
        super_client = await get_super_client()
        
        # Validate token using the internal client
        user_rsp = await super_client.auth.get_user(jwt=token)
        
        if not user_rsp or not user_rsp.user:
            logging.warning("Token validation failed or user not found for token.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, # Use status.HTTP_401_UNAUTHORIZED
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_rsp.user # Return the user object directly
        
    except HTTPException as http_exc:
        # Re-raise known HTTPExceptions (like the 401 above or 500 from get_super_client)
        raise http_exc
    except Exception as e:
        # Catch unexpected errors
        logging.error(f"Unexpected error validating token or getting user: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, # Use status.HTTP_500_INTERNAL_SERVER_ERROR
            detail="Internal server error during authentication"
        )
    finally:
        # Ensure the internally created client session is closed (if applicable)
        # Note: Supabase Python client typically manages connections internally,
        # explicit close might not be needed unless using specific connection pooling.
        # Check Supabase client docs if connection leaks become an issue.
        # if super_client and hasattr(super_client, 'close'): # Example check
        #     await super_client.close()
        pass # Placeholder for potential cleanup if needed
