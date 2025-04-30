import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from pydantic import BaseModel, EmailStr, Field

# Remove deps import
# from deps import CurrentUser, DbDep

# Add direct imports for dependency functions
from db import get_db
from auth import get_current_user, reusable_oauth2
from db_supabase import SupabaseUser # Keep for type hint

# Keep Prisma imports
from prisma import Prisma
from prisma.models import User
from prisma.errors import PrismaError, RecordNotFoundError, UniqueViolationError

# Define Local Pydantic Models (Keep these)
class UserBase(BaseModel):
    email: EmailStr = Field(..., examples=["user@example.com"])
    full_name: str | None = Field(None, examples=["John Doe"])

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, examples=["password123"])

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None

class UserResponse(UserBase):
    id: str # Changed from int to str based on Supabase/Prisma UUID
    is_active: bool = True # Assume active by default if not stored explicitly

    class Config:
        from_attributes = True # Changed from orm_mode

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=UserResponse, operation_id="UsersController_getMe")
async def read_users_me(
    # Add request: Request
    request: Request,
    # Remove current_user: CurrentUser
) -> UserResponse:
    """Get the current user's profile."""
    # --- Manual Fetch DB and User ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request) # auto_error=False handles missing header
    except HTTPException as e:
        # Handle potential errors from reusable_oauth2 if auto_error was True
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        # Use modified get_current_user (which calls get_super_client internally)
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        # Catch exceptions from get_current_user (e.g., 401 invalid token, 500 client error)
        logger.error(f"Authentication error getting user: {e.detail}")
        # Re-raise the exception caught from get_current_user
        raise e 
    except Exception as e:
        logger.error(f"Unexpected error getting user: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user profile")
    # --- End Manual Fetch ---

    logger.info(f"Fetching profile for user ID: {current_user.id}")
    return UserResponse.model_validate(current_user)


@router.get("/", response_model=list[UserResponse], operation_id="UsersController_findAll")
async def read_users(
    # Add request: Request (needed for potential admin check)
    request: Request, 
    # Remove db: DbDep, current_user: CurrentUser
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
) -> list[UserResponse]:
    """Retrieve users. Requires admin privileges."""
    # --- Manual Fetch DB and User (for Admin Check) ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error getting admin status: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting admin status: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user status")
    # --- End Manual Fetch ---
    
    # --- Check Admin ---
    is_admin = getattr(current_user, 'app_metadata', {}).get("claims_admin") is True
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    # -----------------

    logger.info(f"Fetching users with skip={skip}, limit={limit}")
    try:
        users = await db.user.find_many(skip=skip, take=limit)
    except PrismaError as e:
        logger.error(f"Database error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")
    
    return [UserResponse.model_validate(user) for user in users]


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, operation_id="UsersController_create")
async def create_user(
    # Add request: Request (if admin check needed)
    request: Request,
    user_in: UserCreate,
    # Remove db: DbDep
) -> UserResponse:
    """Create new user. Requires admin privileges or specific setup."""
    # --- Manual Fetch DB --- (Admin check would need user fetch as well)
    db = await get_db()
    # --- (Add user fetch and admin check here if required) ---
    # token = ... ; current_user = ... ; if not is_admin: raise ...
    # --- End Manual Fetch ---

    logger.info(f"Attempting to create user with email: {user_in.email}")
    try:
        existing_user = await db.user.find_unique(where={"email": user_in.email})
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        # Hashing logic placeholder
        # hashed_password = get_password_hash(user_in.password)
        
        created_user = await db.user.create(
            data={
                "email": user_in.email,
                "full_name": user_in.full_name,
                # "hashed_password": hashed_password, 
                "is_active": True,
            }
        )
    except PrismaError as e:
        logger.error(f"Database error creating user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")

    return UserResponse.model_validate(created_user)


@router.put("/{user_id}", response_model=UserResponse, operation_id="UsersController_update")
async def update_user(
    # Add request: Request
    request: Request,
    user_id: str,
    user_in: UserUpdate,
    # Remove db: DbDep, current_user: CurrentUser
) -> UserResponse:
    """Update a user. Users can update themselves, admins can update anyone."""
    # --- Manual Fetch DB and User (for Permission Check) ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")
        
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        
    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error getting permission user: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting permission user: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user status for permission check")
    # --- End Manual Fetch ---

    logger.info(f"Attempting to update user ID: {user_id}")
    try:
        user_to_update = await db.user.find_unique(where={"id": user_id})
        if not user_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # --- Permission Check ---
        is_admin = getattr(current_user, 'app_metadata', {}).get("claims_admin") is True
        is_self = current_user.id == user_id
        if not is_self and not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        # ----------------------

        update_data = user_in.model_dump(exclude_unset=True)
        
        if "password" in update_data and update_data["password"]:
            # hashed_password = get_password_hash(update_data["password"])
            # update_data["hashed_password"] = hashed_password
            del update_data["password"]

        updated_user = await db.user.update(
            where={"id": user_id}, data=update_data
        )
        if not updated_user:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found during update")

    except PrismaError as e:
        logger.error(f"Database error updating user {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user")

    return UserResponse.model_validate(updated_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, operation_id="UsersController_remove")
async def delete_user(
    # Add request: Request
    request: Request,
    user_id: str, 
    # Remove db: DbDep, current_user: CurrentUser
):
    """Delete a user. Requires admin privileges."""
    # --- Manual Fetch DB and User (for Admin Check) ---
    db = await get_db()
    token: str | None = None
    try:
        token = await reusable_oauth2(request)
    except HTTPException as e:
        logger.error(f"Token extraction error: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=f"Token error: {e.detail}")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error getting admin status for delete: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting admin status for delete: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve user status for delete check")
    # --- End Manual Fetch ---
    
    # --- Admin Check ---
    is_admin = getattr(current_user, 'app_metadata', {}).get("claims_admin") is True
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    # -----------------

    logger.info(f"Attempting to delete user ID: {user_id}")
    try:
        user_exists = await db.user.find_unique(where={"id": user_id})
        if not user_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        await db.user.delete(where={"id": user_id})
        
    except RecordNotFoundError:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except PrismaError as e:
        logger.error(f"Database error deleting user {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete user")
        
    return None 