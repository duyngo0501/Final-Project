"""Shared FastAPI Dependencies"""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlmodel import Session

from .auth import UserIn, get_current_user
from .db import engine


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a SQLAlchemy session.

    Creates a new SQLModel session for each request and ensures it's closed.

    Yields:
        Session: The database session for the request context.
    """
    # Note: This is intentionally duplicated from db.py to make deps.py self-contained
    # for common dependencies. Consider refactoring if preferred.
    with Session(engine) as session:
        yield session


# Dependency type hint for database sessions
SessionDep = Annotated[Session, Depends(get_db)]

# Dependency type hint for the current user (obtained from token)
CurrentUser = Annotated[UserIn, Depends(get_current_user)]


async def get_current_admin_user(current_user: CurrentUser) -> UserIn:
    """Dependency to get the current user and verify they are an admin.

    Raises:
        HTTPException (403): If the user is not an administrator.

    Returns:
        UserIn: The user object if they are an admin.
    """
    # TODO: Confirm how admin status is stored/checked on the UserIn model.
    # This assumes an 'is_admin' boolean attribute exists.
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


# Dependency type hint for an admin user
AdminUser = Annotated[UserIn, Depends(get_current_admin_user)]
