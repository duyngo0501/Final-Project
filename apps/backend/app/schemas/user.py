import uuid

from pydantic import BaseModel, EmailStr, Field


# Shared properties
class UserBaseSchema(BaseModel):
    """
    Base Pydantic schema for user data.

    Attributes:
        email (EmailStr | None): The user's email address. Defaults to None.
    """

    email: EmailStr | None = None


# Properties to receive via API on creation
class UserCreateSchema(UserBaseSchema):
    """
    Pydantic schema for creating a new user.

    Requires email and password.

    Attributes:
        email (EmailStr): The user's email address.
        password (str): The user's chosen password.
    """

    email: EmailStr
    password: str = Field(min_length=8)


# Properties to receive via API on update
class UserUpdateSchema(UserBaseSchema):
    """
    Pydantic schema for updating user data.

    Allows updating the password.

    Attributes:
        password (str | None): The new password. Defaults to None.
    """

    password: str | None = Field(default=None, min_length=8)


# Properties shared by models stored in DB
class UserInDBBaseSchema(UserBaseSchema):
    """
    Base Pydantic schema for user data stored in the database.

    Includes the user ID and email.

    Attributes:
        id (str): The unique identifier for the user.
        email (EmailStr | None): The user's email address. Defaults to None.
    """

    id: str
    email: EmailStr | None = None

    class Config:
        from_attributes = True  # Replaces orm_mode = True


# Properties to return to client
class UserReadSchema(UserInDBBaseSchema):
    """
    Pydantic schema for returning user data to the client.

    Inherits from UserInDBBaseSchema.
    """

    pass  # Inherit all fields from UserInDBBaseSchema


# Properties stored in DB
class UserInDBSchema(UserInDBBaseSchema):
    """
    Pydantic schema representing the full user data stored in the database.

    Includes the hashed password.

    Attributes:
        hashed_password (str): The user's hashed password.
    """

    hashed_password: str
