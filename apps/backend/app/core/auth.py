"""Core authentication setup using Supabase.

Provides dependencies and utilities for handling authentication via Supabase,
including client creation and user validation from JWT tokens.
"""

import logging
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.schemas.auth import UserIn
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
        # Basic check if client object was created
        if not super_client:
            # This path might be unlikely if create_client raises exceptions,
            # but included for robustness.
            raise ValueError("Supabase client creation returned None")
        return super_client
    except Exception as e:
        logging.error(f"Failed to initialize Supabase super client: {e}")
        raise HTTPException(
            status_code=500, detail="Supabase admin client could not be initialized"
        )


# Dependency type hint for the Supabase admin client.
SuperClient = Annotated[AsyncClient, Depends(get_super_client)]


# OAuth2 Password Bearer scheme for extracting tokens from Authorization header.
reusable_oauth2 = OAuth2PasswordBearer(
    # Points to the API endpoint that issues the token (used by Swagger UI).
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

# Dependency type hint for the token extracted by reusable_oauth2.
TokenDep = Annotated[str, Depends(reusable_oauth2)]


async def get_current_user(token: TokenDep, super_client: SuperClient) -> UserIn:
    """FastAPI dependency to validate a JWT and retrieve the current user.

    Uses the Supabase admin client to verify the token and fetch user details.

    Args:
        token: The JWT token extracted from the Authorization header.
        super_client: The injected Supabase admin client dependency.

    Returns:
        UserIn: A Pydantic model containing the validated user's details.

    Raises:
        HTTPException (401): If the token is invalid, expired, or fails validation.
        HTTPException (404): If the user associated with a valid token is not found.
                           (Less common with JWTs, but possible).
        HTTPException (500): If there's an unexpected error during Supabase interaction.
    """
    try:
        user_rsp = await super_client.auth.get_user(jwt=token)
        if not user_rsp or not user_rsp.user:
            # Consider if 404 is appropriate, 401 might be better for bad tokens
            logging.warning("Token validation failed or user not found for token.")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_data = user_rsp.user.model_dump()
        return UserIn(**user_data, access_token=token)
    except HTTPException as http_exc:
        # Re-raise known HTTPExceptions (like the 401 above)
        raise http_exc
    except Exception as e:
        # Catch unexpected errors from Supabase client or other issues
        logging.error(f"Unexpected error validating token or getting user: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during authentication",
        )
