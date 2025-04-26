"""Core application settings and configuration loading.

Handles loading settings from environment variables or .env files using Pydantic.
"""

import secrets
import warnings
from pathlib import Path  # Import Path
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    Field,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    """Parses CORS origins from a string or list.

    If the input is a comma-separated string, it splits it into a list.
    Otherwise, it returns the input if it's already a list or string.

    Args:
        v: The raw CORS origin value from the environment or settings.

    Returns:
        A list of origin strings or the original string if already parsed.

    Raises:
        ValueError: If the value is not a string or list suitable for parsing.
    """
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    """Core application settings manager.

    Loads configuration from environment variables and/or a .env file,
    provides validation, and computes derived configuration values like
    database URIs and CORS origin lists.

    Attributes:
        model_config: Pydantic settings configuration (e.g., env_file path).
        API_V1_STR: Base path prefix for API v1 routes.
        SECRET_KEY: Secret key for signing tokens, etc. Auto-generated if unset.
        ENVIRONMENT: Deployment environment ('local', 'staging', 'production').
        BACKEND_CORS_ORIGINS: Configured CORS origins for the backend.
        PROJECT_NAME: Name of the project.
        SUPABASE_URL: URL for the Supabase project.
        SUPABASE_KEY: Service role key for Supabase (admin privileges).
        POSTGRES_SERVER: str
        POSTGRES_PORT: int = 5432
        POSTGRES_DB: str
        POSTGRES_USER: str
        POSTGRES_PASSWORD: str
        FIRST_SUPERUSER: Email/username for the initial superuser.
        FIRST_SUPERUSER_PASSWORD: Password for the initial superuser.
    """

    # Pydantic settings configuration
    model_config = SettingsConfigDict(
        # Calculate path relative to this config file
        # Assumes .env is 3 levels up (config.py -> core -> app -> backend)
        env_file="../../../.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # API Configuration
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    # CORS Configuration
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = (
        []
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        """Computes the final list of allowed CORS origins, ensuring no trailing slashes.

        Returns:
            A list of processed origin strings.
        """
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS]

    # Project Information
    PROJECT_NAME: str

    # Supabase Configuration
    SUPABASE_URL: str = Field(default="", env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(
        "",
        env="SUPABASE_KEY",
    )
    # PostgreSQL Attributes
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Computes the SQLAlchemy database connection URI string for PostgreSQL (synchronous)."""
        # Use psycopg2 driver for synchronous operations
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Initial Superuser Configuration
    FIRST_SUPERUSER: str
    FIRST_SUPERUSER_PASSWORD: str

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        """Checks if a sensitive setting still uses the default placeholder.

        Warns locally or raises ValueError in other environments if the value
        is "changethis".

        Args:
            var_name: The name of the setting variable.
            value: The value of the setting variable.

        Raises:
            ValueError: If environment is not 'local' and value is "changethis".
        """
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        """Validates critical secrets are not using default placeholders.

        This Pydantic validator runs after model initialization.

        Returns:
            The validated Settings instance.
        """
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret(
            "FIRST_SUPERUSER_PASSWORD", self.FIRST_SUPERUSER_PASSWORD
        )
        return self


# Global instance of the settings, loaded on import.
settings = Settings()
