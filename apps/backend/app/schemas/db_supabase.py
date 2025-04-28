"""Pydantic Schemas for Supabase Interactions"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid

from pydantic import BaseModel, EmailStr, Field


class SupabaseUser(BaseModel):
    """Represents the user object returned by supabase.auth.get_user()"""

    id: uuid.UUID = Field(..., description="User's unique Supabase ID (UUID)")
    aud: str = Field(..., description="Audience of the JWT")
    role: Optional[str] = Field(None, description="User's role (e.g., 'authenticated')")
    email: Optional[EmailStr] = Field(None, description="User's email address")
    email_confirmed_at: Optional[datetime] = Field(
        None, description="Timestamp when the email was confirmed"
    )
    phone: Optional[str] = Field(None, description="User's phone number")
    phone_confirmed_at: Optional[datetime] = Field(
        None, description="Timestamp when the phone was confirmed"
    )
    confirmed_at: Optional[datetime] = Field(
        None, description="Timestamp when the user was confirmed (if applicable)"
    )
    last_sign_in_at: Optional[datetime] = Field(
        None, description="Timestamp of the last sign-in"
    )
    app_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Non-sensitive application-specific metadata",
    )
    user_metadata: Dict[str, Any] = Field(
        default_factory=dict, description="User-specific metadata"
    )
    identities: Optional[List[Dict[str, Any]]] = Field(
        None, description="User's identities (e.g., email, google)"
    )
    created_at: datetime = Field(..., description="Timestamp when the user was created")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the user was last updated"
    )

    class Config:
        from_attributes = True  # Allow creating from ORM models/objects
        # Optional: If you need to map Supabase field names to different Pydantic names
        # allow_population_by_field_name = True
        # alias_generator = to_camel # If Supabase returns camelCase keys


# You might add more specific schemas derived from this if needed
# Example: A schema representing just the essential info needed for display
# class SupabaseUserBasic(BaseModel):
#     id: uuid.UUID
#     email: Optional[EmailStr]
#     user_metadata: Dict[str, Any] = Field(default_factory=dict)

#     class Config:
#         from_attributes = True
