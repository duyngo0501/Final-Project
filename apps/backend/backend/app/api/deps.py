from typing import Annotated

from fastapi import Depends
from sqlmodel import Session # Restored
# from supabase import Client # Removed

from app.core.auth import get_current_user
from app.core.db import get_db # Restored
# from app.core.supabase_client import supabase_client # Removed
from app.schemas.auth import UserIn

CurrentUser = Annotated[UserIn, Depends(get_current_user)]

# Restore SessionDep
SessionDep = Annotated[Session, Depends(get_db)]

# Removed SupabaseDep
# def get_supabase_client() -> Client:
#     return supabase_client
# SupabaseDep = Annotated[Client, Depends(get_supabase_client)]
