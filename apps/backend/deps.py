"""Shared FastAPI Dependencies"""

import os
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

# Import settings
from config import settings # Import settings
from rich import print

# Corrected import: Changed relative to direct import
from auth import get_current_user

# Remove old engine import
# from .db import engine
# Import the new get_db function from app.core.db
# Corrected import: Changed relative to direct import
from db import (
    get_db as get_prisma_db,
)  # Rename to avoid potential name clash if old get_db was used elsewhere
from db_supabase import SupabaseUser  # Corrected import path for SupabaseUser

# Remove SQLModel Session import
# from sqlmodel import Session
# Import Prisma
from prisma import Prisma

# Dependency type hint for Prisma client instance
# Rename SessionDep to DbDep or PrismaDep for clarity
DbDep = Annotated[Prisma, Depends(get_prisma_db)]

# Dependency type hint for the current user (obtained from token)
CurrentUser = Annotated[SupabaseUser, Depends(get_current_user)]
