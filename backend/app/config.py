from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "My FastAPI Project"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db" # Default to async sqlite
    # Example PostgreSQL async URL: "postgresql+asyncpg://user:password@host:port/database"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here" # CHANGE THIS!
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"] # Frontend address
    
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings() 