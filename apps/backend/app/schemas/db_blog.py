import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Base schema with common fields
class BlogBase(BaseModel):
    title: str
    author: str  # Consider linking to user ID later
    date: Optional[datetime] = None  # Use datetime, make optional or default
    excerpt: Optional[str] = None
    content: str


# Schema for creating a blog post (inherits base fields)
class BlogCreate(BlogBase):
    pass  # Add specific create fields if needed


# Schema for updating a blog post (all fields optional)
class BlogUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    date: Optional[datetime] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None


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
