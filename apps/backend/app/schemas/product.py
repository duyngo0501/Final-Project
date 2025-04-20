from datetime import date

from pydantic import BaseModel, HttpUrl

# --- Schemas based on RAWG.io structure ---

class BaseProperties(BaseModel):
    id: int
    name: str
    slug: str

class PlatformInfo(BaseModel):
    platform: BaseProperties
    released_at: date | None = None
    # requirements_en: Optional[dict] = None # Can add later if needed
    # requirements_ru: Optional[dict] = None

class ParentPlatformInfo(BaseModel):
    platform: BaseProperties

class GenreInfo(BaseProperties):
    games_count: int | None = None
    image_background: HttpUrl | None = None

# Define the main product/game schema mirroring RAWG fields
class Product(BaseModel):
    id: int
    slug: str
    name: str
    released: date | None = None
    tba: bool = False
    background_image: HttpUrl | None = None
    rating: float = 0.0
    rating_top: int = 0
    # ratings: Optional[List[dict]] = None # Can add detailed ratings later
    ratings_count: int = 0
    metacritic: int | None = None
    playtime: int = 0
    suggestions_count: int = 0
    updated: str | None = None # Or datetime if parsing needed
    platforms: list[PlatformInfo] | None = []
    parent_platforms: list[ParentPlatformInfo] | None = []
    genres: list[GenreInfo] | None = []
    # stores: Optional[List[dict]] = [] # Add later if needed
    # tags: Optional[List[dict]] = [] # Add later if needed
    # esrb_rating: Optional[dict] = None # Add later if needed
    # short_screenshots: Optional[List[dict]] = [] # Add later if needed

# Define the overall listing response schema
class ProductListingResponse(BaseModel):
    count: int
    next: HttpUrl | None = None
    previous: HttpUrl | None = None
    results: list[Product]

# You might also want schemas for creating/updating if you store products
# class ProductCreate(BaseModel): ...
# class ProductUpdate(BaseModel): ... 
