"""SQLModel definition for Promotions and related types."""

import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
import uuid
from uuid import UUID  # Import UUID type

from sqlmodel import Enum as SQLModelEnum, Field, Relationship, SQLModel

# Conditional import for type hinting
if TYPE_CHECKING:
    from .model_game import Game  # Use the current Game model

# Remove explicit import of the link model class - it's defined below
# from .model_game import GamePromotionLink


class DiscountType(str, enum.Enum):
    """Enumeration for the type of discount a promotion offers."""

    PERCENTAGE = "percentage"
    FIXED = "fixed"


class GamePromotionLink(SQLModel, table=True):
    # Keep game_id as UUID
    game_id: Optional[UUID] = Field(
        default=None, foreign_key="games.id", primary_key=True
    )
    # --- Change promotion_id to UUID --- #
    promotion_id: Optional[UUID] = Field(
        default=None, foreign_key="promotions.id", primary_key=True
    )
    # ---------------------------------- #


class PromotionItem(SQLModel, table=True):
    """Represents a promotional offer or discount code in the database.

    Stores details about a promotion, including its code, discount value,
    validity period, and the games it applies to.

    Attributes:
        id: Unique identifier for the promotion (seems to be string, consider UUID).
        code: The unique code customers use to apply the promotion.
        description: Optional text description of the promotion.
        discount_type: The type of discount (percentage or fixed amount).
        discount_value: The numerical value of the discount.
        start_date: Optional date and time when the promotion becomes active.
        end_date: Optional date and time when the promotion expires.
        is_active: Boolean indicating if the promotion is currently active.
        created_at: Timestamp when the promotion record was created.
        updated_at: Timestamp when the promotion record was last updated.
        games: Relationship to the list of GameItem instances this promotion
               applies to (via GamePromotionLink).
    """

    __tablename__ = "promotions"

    # --- Change ID to UUID --- #
    id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    # ----------------------- #
    code: str = Field(max_length=100, unique=True, index=True, nullable=False)
    description: str | None = Field(default=None, max_length=255)

    # Use SQLModel's way of handling Enums in the database
    # Define nullability within the sa_column definition
    discount_type: DiscountType = Field(
        sa_column=SQLModelEnum(DiscountType, nullable=False),
        default=DiscountType.PERCENTAGE,
    )
    discount_value: float = Field(gt=0, nullable=False)  # Ensure value is positive

    # Validity period
    start_date: datetime | None = Field(default=None)
    end_date: datetime | None = Field(default=None)

    is_active: bool = Field(default=True, nullable=False, index=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
    )

    # Relationships
    # Many-to-many relationship with GameItem via GamePromotionLink
    games: List["Game"] = Relationship(
        back_populates="promotions", link_model=GamePromotionLink
    )

    # No __repr__ needed typically with SQLModel, Pydantic handles representation
