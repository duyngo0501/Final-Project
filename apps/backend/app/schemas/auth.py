from typing import Any

from gotrue import User, UserAttributes  # type: ignore
from pydantic import BaseModel, Field


# Shared properties
class Token(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None


# request
class UserIn(Token, User):  # type: ignore
    # Attempt to capture metadata which might contain role info
    app_metadata: dict[str, Any] = Field(default_factory=dict)
    user_metadata: dict[str, Any] = Field(default_factory=dict)

    pass


# Properties to receive via API on creation
# in
class UserCreate(BaseModel):
    pass


# Properties to receive via API on update
# in
class UserUpdate(UserAttributes):  # type: ignore
    pass


# response


class UserInDBBase(BaseModel):
    pass


# Properties to return to client via api
# out
class UserOut(Token):
    pass


# Properties properties stored in DB
class UserInDB(User):  # type: ignore
    pass
