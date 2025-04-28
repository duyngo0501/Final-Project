from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

# Dependencies
from deps import AdminUser, DbDep

# Import Prisma errors
from prisma.errors import PrismaError, RecordNotFoundError

# Import Prisma model for inheritance
from prisma.models import Blog

# --- Define Local Pydantic Models ---


class BlogResponse(Blog, BaseModel):
    class Config:
        from_attributes = True


# --- Input Schemas ---


class BlogCreate(BaseModel):
    title: str = Field(..., examples=["My First Blog Post"])
    content: str = Field(..., examples=["This is the content..."])
    author_id: str = Field(..., examples=["user-uuid-123"])


class BlogUpdate(BaseModel):
    title: str | None = Field(None, examples=["Updated Blog Post Title"])
    content: str | None = Field(None, examples=["Updated content..."])


router = APIRouter()

# --- Blog Post Endpoints ---


@router.post(
    "/",
    response_model=BlogResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(AdminUser)],
    operation_id="BlogController_createBlogPost",
)
async def create_blog_post(*, db: DbDep, blog_in: BlogCreate) -> BlogResponse:
    """
    Create a new blog post (Admin only).
    """
    try:
        data_to_create = blog_in.model_dump(exclude_unset=True)
        new_post = await db.blog.create(data=data_to_create)
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error creating blog post: {e}",
        )
    return BlogResponse.model_validate(new_post)


@router.get(
    "/", response_model=list[BlogResponse], operation_id="BlogController_readBlogPosts"
)
async def read_blog_posts(
    db: DbDep, skip: int = 0, limit: int = 100
) -> list[BlogResponse]:
    """
    Retrieve a list of blog posts.
    """
    try:
        posts = await db.blog.find_many(
            skip=skip, take=limit, order_by={"created_at": "desc"}
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error retrieving blog posts: {e}",
        )
    return [BlogResponse.model_validate(p) for p in posts]


@router.get(
    "/{post_id}",
    response_model=BlogResponse,
    operation_id="BlogController_readBlogPost",
)
async def read_blog_post(*, db: DbDep, post_id: str) -> BlogResponse:
    """
    Get a single blog post by its ID.
    """
    try:
        db_post = await db.blog.find_unique(where={"id": post_id})
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error retrieving blog post: {e}",
        )

    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )
    return BlogResponse.model_validate(db_post)


@router.put(
    "/{post_id}",
    response_model=BlogResponse,
    dependencies=[Depends(AdminUser)],
    operation_id="BlogController_updateBlogPost",
)
async def update_blog_post(
    *, db: DbDep, post_id: str, blog_in: BlogUpdate
) -> BlogResponse:
    """
    Update a blog post by ID (Admin only).
    """
    try:
        data_to_update = blog_in.model_dump(exclude_unset=True)
        updated_post = await db.blog.update(where={"id": post_id}, data=data_to_update)
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error updating blog post: {e}",
        )
    return BlogResponse.model_validate(updated_post)


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(AdminUser)],
    operation_id="BlogController_deleteBlogPost",
)
async def delete_blog_post(*, db: DbDep, post_id: str) -> None:
    """
    Delete a blog post by ID (Admin only).
    """
    try:
        deleted_post = await db.blog.delete(where={"id": post_id})
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )
    except PrismaError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error deleting blog post: {e}",
        )
    return None
