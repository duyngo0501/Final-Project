from passlib.context import CryptContext

# Initialize CryptContext with bcrypt as the hashing scheme
# bcrypt is a good default choice for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed password.

    Args:
        plain_password (str): The plain text password to verify.
        hashed_password (str): The hashed password stored in the database.

    Returns:
        bool: True if the password matches the hash, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes a plain text password using the configured scheme (bcrypt).

    Args:
        password (str): The plain text password to hash.

    Returns:
        str: The resulting hashed password.
    """
    return pwd_context.hash(password)


# TODO: Add JWT token creation/verification functions later if needed for login
# from datetime import datetime, timedelta, timezone
# from jose import jwt
# from app.core.config import settings # Assuming settings file exists
# ALGORITHM = "HS256"
# def create_access_token(subject: Union[str, Any], expires_delta: timedelta | None = None) -> str:
# ...
# def verify_access_token(token: str) -> dict:
# ...
