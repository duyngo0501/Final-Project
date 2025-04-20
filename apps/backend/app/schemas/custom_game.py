import uuid
from datetime import date

from pydantic import BaseModel, HttpUrl

# --- Schemas for CustomGame Model ---

# Properties to receive via API on creation
# Assume slug is generated from name automatically later
class CustomGameBase(BaseModel):
    name: str
    description: str | None = None
    released: date | None = None
    background_image: HttpUrl | None = None

class CustomGameCreate(CustomGameBase):
    # You might require certain fields during creation
    name: str # Example: Explicitly require name

# Properties to return via API
class CustomGamePublic(CustomGameBase):
    id: uuid.UUID # Include the generated ID
    slug: str # Include the generated slug

# Maybe a schema for listing multiple custom games
class CustomGameList(BaseModel):
    data: list[CustomGamePublic]
    count: int 
