from pydantic import BaseModel, HttpUrl
import uuid
from typing import List, Optional
from datetime import date

# --- Schemas based on RAWG.io structure ---

class BaseProperties(BaseModel):
    id: int
    name: str
    slug: str

class PlatformInfo(BaseModel):
    platform: BaseProperties
    released_at: Optional[date] = None
    # requirements_en: Optional[dict] = None # Can add later if needed
    # requirements_ru: Optional[dict] = None

class ParentPlatformInfo(BaseModel):
    platform: BaseProperties

class GenreInfo(BaseProperties):
    games_count: Optional[int] = None
    image_background: Optional[HttpUrl] = None

# Define the main product/game schema mirroring RAWG fields
class Product(BaseModel):
    id: int
    slug: str
    name: str
    released: Optional[date] = None
    tba: bool = False
    background_image: Optional[HttpUrl] = None
    rating: float = 0.0
    rating_top: int = 0
    # ratings: Optional[List[dict]] = None # Can add detailed ratings later
    ratings_count: int = 0
    metacritic: Optional[int] = None
    playtime: int = 0
    suggestions_count: int = 0
    updated: Optional[str] = None # Or datetime if parsing needed
    platforms: Optional[List[PlatformInfo]] = []
    parent_platforms: Optional[List[ParentPlatformInfo]] = []
    genres: Optional[List[GenreInfo]] = []
    # stores: Optional[List[dict]] = [] # Add later if needed
    # tags: Optional[List[dict]] = [] # Add later if needed
    # esrb_rating: Optional[dict] = None # Add later if needed
    # short_screenshots: Optional[List[dict]] = [] # Add later if needed

# Define the overall listing response schema
class ProductListingResponse(BaseModel):
    count: int
    next: Optional[HttpUrl] = None
    previous: Optional[HttpUrl] = None
    results: List[Product]

# You might also want schemas for creating/updating if you store products
# class ProductCreate(BaseModel): ...
# class ProductUpdate(BaseModel): ... 