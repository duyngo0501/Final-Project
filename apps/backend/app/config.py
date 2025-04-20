import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, EmailStr, validator
from typing import List, Optional
from functools import lru_cache
from datetime import timedelta

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # Core application settings
    PROJECT_NAME: str = "Game Store API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Database settings
    # Ensure this matches the variable name in your .env file
    DATABASE_URL: str = "sqlite:///./games.db" 

    # Security settings
    # Ensure these match the variable names in your .env file
    SECRET_KEY: str = "default_super_secret_key_change_me" 
    JWT_SECRET_KEY: str = "default_jwt_secret_key_change_me_too"
    # Algorithm for JWT, HS256 is common
    JWT_ALGORITHM: str = "HS256" 
    # Token expiry times (from Flask app)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30 

    # CORS settings
    # List of allowed origins. Use ["*"] for testing/development if needed, 
    # but be more specific in production.
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:5173"] 

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Optional: Add other settings as needed, e.g., email settings, third-party API keys

    model_config = SettingsConfigDict(
        env_file=".env",          # Load from .env file
        env_file_encoding='utf-8',
        case_sensitive=True,       # Match environment variable names exactly
        extra='ignore'             # Ignore extra fields from .env
    )

# Use lru_cache to load settings only once
@lru_cache()
def get_settings() -> Settings:
    """Returns the cached application settings."""
    return Settings()

# Example usage:
# from app.config import get_settings
# settings = get_settings()
# print(settings.DATABASE_URL) 