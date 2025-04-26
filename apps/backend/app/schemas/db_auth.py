"""Pydantic schemas for Authentication and User Management.

Defines schemas for handling tokens, user data from Supabase, and potential
API request/response models for user operations.
"""

from typing import Any

from gotrue import User, UserAttributes  # type: ignore
from pydantic import BaseModel, Field


# Shared properties
class TokenSchema(BaseModel):
    """Schema for representing authentication tokens.

    Attributes:
        access_token: The JWT access token.
        refresh_token: The refresh token (optional).
    """

    access_token: str | None = None
    refresh_token: str | None = None


# New response schema for the login endpoint
class TokenResponseSchema(BaseModel):
    """Schema for the token response after successful login.

    Attributes:
        access_token (str): The JWT access token.
        token_type (str): The type of token (typically "bearer").
    """

    access_token: str
    token_type: str = "bearer"


# request
class UserIn(TokenSchema, User):  # type: ignore
    """Represents validated user data retrieved from Supabase Auth.

    Inherits token fields from TokenSchema and user fields from gotrue.User.
    Includes Supabase-specific metadata fields.
    Used internally, typically after validating a token.

    Attributes:
        app_metadata: Application-specific metadata stored in Supabase Auth.
        user_metadata: User-specific metadata stored in Supabase Auth.
        # Inherits all attributes from gotrue.User (id, email, etc.)
        # Inherits access_token, refresh_token from TokenSchema
    """

    # Capture metadata which might contain roles, etc.
    app_metadata: dict[str, Any] = Field(default_factory=dict)
    user_metadata: dict[str, Any] = Field(default_factory=dict)

    # Inherits other fields from User and TokenSchema
    pass


# Properties to receive via API on creation
# in
class UserCreateSchema(BaseModel):
    """Schema for creating a new user via the API (Placeholder).

    Currently empty. Define fields required for user creation if implementing
    direct user registration via the API (e.g., email, password).
    """

    pass


# Properties to receive via API on update
# in
class UserUpdateSchema(UserAttributes):  # type: ignore
    """Schema for updating user attributes via the API (Placeholder).

    Inherits fields from gotrue.UserAttributes.
    Define allowed updatable fields if implementing user profile updates.
    """

    pass


# response


class UserInDBBase(BaseModel):
    """Base schema for user properties stored in the database (Placeholder).

    Could be used if separating DB model structure from Pydantic models,
    but SQLModel often serves as both.
    """

    pass


# Properties to return to client via api
# out
class UserResponseSchema(TokenSchema):
    """Schema for user data returned to the client (Placeholder).

    Currently only includes token information. Define fields to expose
    publicly about a user (e.g., id, email, full_name, maybe metadata).
    """

    # Example fields (add as needed):
    # id: uuid.UUID
    # email: str
    # full_name: Optional[str] = None
    pass


# Properties properties stored in DB
class UserInDB(User):  # type: ignore
    """Schema representing user properties as stored in the database (Placeholder).

    Inherits from gotrue.User. Might be redundant if using SQLModel UserItem
    directly for database interactions.
    """

    pass
