import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Request, Query, Path, Response
from pydantic import BaseModel, Field

# Direct imports (assuming apps/backend is in PYTHONPATH or handled by execution context)
from config import settings
from db import get_db
from auth import get_current_user, reusable_oauth2
from db_supabase import SupabaseUser  # For type hint
from prisma import Prisma  # For type hint
from prisma.errors import PrismaError, RecordNotFoundError, UniqueViolationError

# Import the generated Prisma model directly
from prisma.models import Blog as BlogModel

logger = logging.getLogger(__name__)
router = APIRouter()

# --- Manually Defined Pydantic Schemas (Aligned with Prisma Schema w/o Status) --- #


# Base schema for fields users can input (matches non-generated Blog fields)
class BlogBase(BaseModel):
    title: str = Field(..., examples=["New Game Announcement"])
    author: str = Field(..., examples=["Admin User"])
    excerpt: Optional[str] = Field(None, examples=["Check out the latest game..."])
    content: str = Field(..., examples=["<p>Details about the game...</p>"])
    date: Optional[datetime] = Field(None, description="Optional publish date")


# Schema for creating a blog post (inherits required fields)
class BlogCreateSchema(BlogBase):
    pass


# Schema for updating a blog post (all fields optional)
class BlogUpdateSchema(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    date: Optional[datetime] = None


# Schema for responses, aligning with the generated BlogModel
class BlogResponseSchema(BlogBase):
    id: str

    class Config:
        from_attributes = True  # Enable mapping from ORM model (BlogModel)


# Schema for list responses
class BlogListResponse(BaseModel):
    items: List[BlogResponseSchema]
    total: int


# --- Routes using the defined Schemas --- #


@router.get(
    "/",
    response_model=BlogListResponse,  # Use manual list response schema
    summary="List Blog Posts",
    description="Retrieve a list of blog posts with pagination. Publicly accessible.",
)
async def list_blog_posts(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
) -> BlogListResponse:
    """Lists blog posts with pagination."""
    db = await get_db()
    try:
        total = await db.blog.count()
        # Get ORM models
        posts: List[BlogModel] = await db.blog.find_many(
            skip=skip,
            take=limit,
            order=[
                {"date": "desc"},
            ],
        )
        # Validate ORM models against Response Schema
        return BlogListResponse(
            items=[BlogResponseSchema.model_validate(p) for p in posts], total=total
        )
    except PrismaError as e:
        logger.error(f"Database error listing blogs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve blog posts",
        )
    except Exception as e:
        logger.error(f"Unexpected error listing blogs: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )


@router.get(
    "/{blog_id}",
    response_model=BlogResponseSchema,  # Use manual response schema
    summary="Get Blog Post",
    description="Retrieve a single blog post by its ID. Publicly accessible.",
)
async def get_blog_post(
    request: Request,
    blog_id: str = Path(..., description="The UUID of the blog post to retrieve"),
) -> BlogResponseSchema:
    """Gets a single blog post by ID."""
    db = await get_db()
    try:
        # Get ORM model
        post: Optional[BlogModel] = await db.blog.find_unique(where={"id": blog_id})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Blog post with ID {blog_id} not found",
            )
        # Validate ORM model against Response Schema
        return BlogResponseSchema.model_validate(post)
    except PrismaError as e:
        logger.error(f"Database error getting blog {blog_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve blog post",
        )
    except Exception as e:
        logger.error(f"Unexpected error getting blog {blog_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )


@router.post(
    "/",
    response_model=BlogResponseSchema,  # Use manual response schema
    status_code=status.HTTP_201_CREATED,
    summary="Create Blog Post",
    description="Create a new blog post. Requires admin privileges.",
)
async def create_blog_post(
    request: Request, blog_in: BlogCreateSchema  # Use manual create schema
) -> BlogResponseSchema:
    """Creates a new blog post after verifying admin user."""
    db = await get_db()
    token: Optional[str] = None
    try:
        token = await reusable_oauth2(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        # Catches errors from reusable_oauth2 or get_current_user
        logger.error(f"Authentication error creating blog post: {e.detail}")
        raise e  # Re-raise the specific auth error (e.g., 401)
    except Exception as e:
        logger.error(f"Unexpected error during auth check: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication check failed",
        )

    # --- Authorization Check ---
    logger.info(
        f"Checking admin auth: User Email=[{current_user.email}], Admin Email=[{settings.ADMIN_EMAIL}]"
    )
    is_admin = current_user.email == settings.ADMIN_EMAIL
    if not is_admin:
        logger.warning(f"Admin auth failed for user: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to create blog posts",
        )
    # -------------------------

    logger.info(f"Admin auth successful for user: {current_user.email}")
    try:
        # Use model_dump from the input schema
        data_to_create = blog_in.model_dump(exclude_unset=True)
        # Create using ORM model
        new_post: BlogModel = await db.blog.create(data=data_to_create)
        # Validate ORM model against Response Schema
        return BlogResponseSchema.model_validate(new_post)

    except UniqueViolationError as e:
        # If title needs to be unique, handle this
        logger.warning(f"Blog creation conflict: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Blog post creation failed due to a conflict (e.g., duplicate title).",
        )
    except PrismaError as e:
        logger.error(f"Database error creating blog post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create blog post in database",
        )
    except Exception as e:
        logger.error(f"Unexpected error creating blog post: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )


@router.put(
    "/{blog_id}",
    response_model=BlogResponseSchema,  # Use manual response schema
    summary="Update Blog Post",
    description="Update an existing blog post by ID. Requires admin privileges.",
)
async def update_blog_post(
    request: Request,  # Non-default
    blog_in: BlogUpdateSchema,  # Non-default (Request Body)
    blog_id: str = Path(
        ..., description="The UUID of the blog post to update"
    ),  # Default via Path
) -> BlogResponseSchema:
    """Updates an existing blog post after verifying admin user."""
    db = await get_db()
    token: Optional[str] = None
    try:
        token = await reusable_oauth2(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error updating blog post {blog_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(
            f"Unexpected error during auth check for update: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication check failed",
        )

    # --- Authorization Check ---
    is_admin = current_user.email == settings.ADMIN_EMAIL
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to update blog posts",
        )
    # -------------------------

    try:
        # Use model_dump from the input schema
        update_data = blog_in.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        # Update using ORM model
        updated_post: Optional[BlogModel] = await db.blog.update(
            where={"id": blog_id}, data=update_data
        )

        if not updated_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Blog post with ID {blog_id} not found for update",
            )

        # Validate ORM model against Response Schema
        return BlogResponseSchema.model_validate(updated_post)

    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post with ID {blog_id} not found",
        )
    except PrismaError as e:
        logger.error(f"Database error updating blog post {blog_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update blog post in database",
        )
    except Exception as e:
        logger.error(
            f"Unexpected error updating blog post {blog_id}: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )


@router.delete(
    "/{blog_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Blog Post",
    description="Delete an existing blog post by ID. Requires admin privileges.",
    response_description="Blog post successfully deleted.",
)
async def delete_blog_post(
    request: Request,
    blog_id: str = Path(..., description="The UUID of the blog post to delete"),
):
    """Deletes an existing blog post after verifying admin user."""
    db = await get_db()
    token: Optional[str] = None
    try:
        token = await reusable_oauth2(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        current_user: SupabaseUser = await get_current_user(token=token)
    except HTTPException as e:
        logger.error(f"Authentication error deleting blog post {blog_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(
            f"Unexpected error during auth check for delete: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication check failed",
        )

    # --- Authorization Check ---
    is_admin = current_user.email == settings.ADMIN_EMAIL
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to delete blog posts",
        )
    # -------------------------

    try:
        # Delete using ORM model
        deleted_post: Optional[BlogModel] = await db.blog.delete(where={"id": blog_id})

        if not deleted_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Blog post with ID {blog_id} not found for deletion",
            )

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except RecordNotFoundError:
        # If the record is already gone, arguably this is success for DELETE.
        # However, standard practice is often 404 if it never existed or was already deleted.
        # Sticking with 404 for clarity.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post with ID {blog_id} not found",
        )
    except PrismaError as e:
        logger.error(f"Database error deleting blog post {blog_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete blog post from database",
        )
    except Exception as e:
        logger.error(
            f"Unexpected error deleting blog post {blog_id}: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )
