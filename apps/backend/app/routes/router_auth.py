# Placeholder for Authentication routes (e.g., login, register, refresh, password reset)
# Logic might be migrated here from Flask app or implemented using FastAPI utils

import logging
import traceback
from typing import Annotated
import uuid  # Ensure uuid is imported

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from gotrue.errors import AuthApiError  # Import Supabase error type
from sqlmodel import Session

# Use correct imports
from app.core.auth import SuperClient  # Import Supabase client dependency
from app.core.db import get_db
from app.dal.crud_user import user as crud_user

# Update import paths
from app.schemas.db_auth import TokenResponseSchema
from app.schemas.db_user import UserCreateSchema, UserReadSchema

router = APIRouter()


@router.post(
    "/login", response_model=TokenResponseSchema, operation_id="AuthController_login"
)
async def login(
    super_client: SuperClient,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    """Authenticates a user with email and password using Supabase Auth.

    Args:
        super_client: Dependency injecting the Supabase admin client.
        form_data: Dependency getting email (as username) and password from form data.

    Raises:
        HTTPException (401): If authentication fails due to invalid credentials.
        HTTPException (500): If there's an unexpected error during Supabase interaction.

    Returns:
        TokenResponseSchema: Contains the access token and token type ("bearer").
    """
    try:
        # Use Supabase client to sign in
        session_rsp = await super_client.auth.sign_in_with_password(
            {"email": form_data.username, "password": form_data.password}
        )

        if (
            not session_rsp
            or not session_rsp.session
            or not session_rsp.session.access_token
        ):
            # This case might indicate an issue with Supabase response structure
            # or an unexpected null session/token despite no AuthApiError
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Login successful but failed to retrieve token from Supabase.",
            )

        return TokenResponseSchema(
            access_token=session_rsp.session.access_token,
            # refresh_token=session_rsp.session.refresh_token, # Optionally include refresh token
            token_type="bearer",
        )
    except AuthApiError as e:
        # Specific error for invalid credentials from Supabase
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect email or password: {e.message}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException as http_exc:
        # Re-raise known HTTPExceptions
        raise http_exc
    except Exception as e:
        # Catch-all for other unexpected errors
        # Log the full traceback for server-side debugging
        tb_str = traceback.format_exc()
        logging.error(f"Unexpected login error: {e}\nTraceback:\n{tb_str}")
        # Return a generic error WITH TRACEBACK to the client (DEBUGGING ONLY - INSECURE)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during login: {e}\nTraceback:\n{tb_str}",
        )


@router.post(
    "/register",
    response_model=UserReadSchema,
    operation_id="AuthController_registerUser",
)
async def register_user(
    *,
    db: Session = Depends(get_db),  # Use get_db directly
    super_client: SuperClient,  # Inject Supabase client
    user_in: UserCreateSchema,  # Use updated schema
):
    """Register a new user in both Supabase Auth and the local database.
    1. Attempts to sign up the user in Supabase Auth.
    2. If successful, creates a corresponding user record in the local DB.

    Args:
        db: Database session dependency.
        super_client: Supabase client dependency.
        user_in: User registration data (email, password, optional full_name).

    Raises:
        HTTPException (400): If user already exists (local check - may be redundant),
                           or if Supabase sign-up fails (e.g., weak password, email exists in Supabase).
        HTTPException (500): For unexpected errors during Supabase interaction or local DB creation.

    Returns:
        UserReadSchema: The newly created local user's data.
    """
    # --- Supabase Sign-up Attempt ---
    try:
        sign_up_resp = await super_client.auth.sign_up(
            {"email": user_in.email, "password": user_in.password}
        )
        if not sign_up_resp or not sign_up_resp.user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase sign-up succeeded but no user data was returned.",
            )
        # --- Get Supabase User ID --- #
        supabase_user_id = sign_up_resp.user.id
        # -------------------------- #

    except AuthApiError as e:
        # Handle specific Supabase errors (e.g., email exists, weak password)
        # You might want to return more specific details based on e.message or e.status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {e.message}",
        )
    except Exception as e:
        # Catch unexpected Supabase client errors
        tb_str = traceback.format_exc()
        logging.error(f"Unexpected Supabase sign-up error: {e}\nTraceback:\n{tb_str}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration with authentication service.",
        )

    # --- Local Database User Creation ---
    # Optional: Check if user already exists locally *before* Supabase call?
    # Current check might be redundant if Supabase signup fails for existing email anyway.
    # Consider removing this local pre-check if Supabase is the source of truth for email uniqueness.
    local_user = crud_user.get_user_by_email(db, email=user_in.email)
    if local_user:
        # This case is tricky. User exists locally but was just created in Supabase.
        # Option 1: Update local user? (Maybe link Supabase ID)
        # Option 2: Raise error? (Indicates inconsistency)
        # Option 3: Ignore and proceed? (Might lead to duplicates if called again)
        # For now, let's raise an error indicating inconsistency.
        logging.warning(
            f"User {user_in.email} created in Supabase but already exists locally."
            f" Supabase ID: {supabase_user_id}"
        )
        # Depending on strategy, you might not want to raise here.
        # raise HTTPException(
        #     status_code=409, # Conflict
        #     detail="User already exists locally. Inconsistent state."
        # )
        # Let's just return the existing local user for now, assuming it should match.
        # This implicitly assumes the first registration attempt failed mid-way.
        # A better approach might involve linking IDs or a more robust sync strategy.
        # Consider updating the local user with the supabase_user_id if it doesn't match?
        return local_user  # Needs UserReadSchema conversion?

    try:
        # --- Pass Supabase ID to local creation --- #
        created_user = crud_user.create(db=db, obj_in=user_in, id=supabase_user_id)
        # ------------------------------------------ #
        return created_user
    except Exception as e:
        # Catch errors during local DB creation
        # Consider rolling back Supabase user creation? (Complex)
        tb_str = traceback.format_exc()
        logging.error(
            f"Error creating local user {user_in.email} after Supabase sign-up: {e}"
            f"Supabase User ID: {supabase_user_id}\nTraceback:\n{tb_str}"
        )
        # Raise 500, potentially leaving user in Supabase but not locally
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user record locally after successful sign-up.",
        )


# Add other auth routes like /refresh-token, /forgot-password, /reset-password here
