"""Shared FastAPI Dependencies"""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlmodel import Session

from .auth import UserIn, get_current_user
from .db import engine

# Import settings to access ADMIN_EMAIL
from app.config import settings

# Use rich print for logging
from rich import print


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a SQLAlchemy session.

    Creates a new SQLModel session for each request and ensures it's closed.

    Yields:
        Session: The database session for the request context.
    """
    print("[blue]deps.py:[/] Creating database session.")
    session = None  # Initialize session variable
    session_id = None
    try:
        with Session(engine) as session:
            session_id = id(session)
            print(f"[blue]deps.py:[/] Session {session_id} created and yielded.")
            yield session
            # Explicitly check session state before implicit commit
            if session.dirty or session.new or session.deleted:
                print(
                    f"[yellow]deps.py:[/] Session {session_id} has pending changes (dirty/new/deleted), expecting commit."
                )
            else:
                print(
                    f"[green]deps.py:[/] Session {session_id} has no pending changes."
                )
        # If `with` block exits without error, commit happens implicitly
        print(
            f"[green]deps.py:[/] Session {session_id} context manager exited successfully (commit expected)."
        )
    except Exception as e:
        # Use rich print for error, potentially with traceback
        print(
            f"[bold red]deps.py: ERROR[/] Exception occurred in session {session_id} context:"
        )
        from rich.traceback import Traceback

        print(Traceback(show_locals=True))  # Print rich traceback
        # Rollback happens implicitly due to exception
        raise  # Re-raise the exception so FastAPI handles it
    finally:
        # Session is automatically closed by the context manager `with Session(...)`
        print(f"[blue]deps.py:[/] Session {session_id} context manager finished.")


# Dependency type hint for database sessions
SessionDep = Annotated[Session, Depends(get_db)]

# Dependency type hint for the current user (obtained from token)
CurrentUser = Annotated[UserIn, Depends(get_current_user)]


async def get_current_admin_user(current_user: CurrentUser) -> UserIn:
    """Dependency to get the current user and verify they are the configured admin.

    Compares the authenticated user's email against the ADMIN_EMAIL setting.

    Raises:
        HTTPException (403): If the user's email does not match ADMIN_EMAIL.

    Returns:
        UserIn: The user object if they are the configured admin.
    """
    # Compare email with the ADMIN_EMAIL setting
    if current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    # Add a print statement for verification during testing
    print(f"[bold green]Admin access granted for:[/bold green] {current_user.email}")
    return current_user


# Dependency type hint for an admin user
AdminUser = Annotated[UserIn, Depends(get_current_admin_user)]
