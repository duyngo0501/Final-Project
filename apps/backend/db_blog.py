from datetime import datetime

from pydantic import BaseModel


# Base schema with common fields
class BlogBase(BaseModel):
    title: str
    author: str  # Consider linking to user ID later
    date: datetime | None = None  # Use datetime, make optional or default
    excerpt: str | None = None
    content: str


# Schema for creating a blog post (inherits base fields)
class BlogCreate(BlogBase):
    pass  # Add specific create fields if needed


# Schema for updating a blog post (all fields optional)
class BlogUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    date: datetime | None = None
    excerpt: str | None = None
    content: str | None = None


# Schema for returning blog post data to the client (includes ID)
# class BlogPublic(BlogBase):
#     id: str
#
#
# # Schema for listing multiple blog posts (optional, could use List[BlogPublic])
# # class BlogList(BaseModel): # Or BaseModel
# #     results: list[BlogPublic]
# #     count: int
# # Add next/previous for pagination if needed
