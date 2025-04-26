import uuid
from collections.abc import Sequence
from datetime import datetime
from typing import Any, List, Optional, Generic, Type, TypeVar

from sqlmodel import Session, select

from app.schemas.db_promotion import PromotionCreateRow, PromotionUpdateRow
from app.models.model_promotion import PromotionItem

# Try importing directly from sibling directories


class CRUDPromotion:
    """CRUD operations for PromotionItem model."""

    def __init__(self, model: type[PromotionItem]):
        self.model = model

    def get(self, session: Session, *, id: str) -> PromotionItem | None:
        """Retrieve a promotion by its ID."""
        return session.get(self.model, id)

    def get_by_code(self, session: Session, *, code: str) -> PromotionItem | None:
        """Retrieve a promotion by its unique code."""
        statement = select(self.model).where(self.model.code == code)
        return session.exec(statement).first()

    def get_multi(
        self,
        session: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        is_active: bool | None = None,  # Optional filter for active promotions
    ) -> List[PromotionItem]:
        """Retrieve multiple promotions with pagination and optional active filter."""
        statement = select(self.model)
        if is_active is not None:
            statement = statement.where(self.model.is_active == is_active)
        statement = statement.order_by(self.model.created_at.desc())
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get_multi_active(
        self, session: Session, *, skip: int = 0, limit: int = 100
    ) -> Sequence[PromotionItem]:
        """Get multiple active and valid promotions with pagination."""
        now = datetime.utcnow()
        statement = (
            select(self.model)
            .where(
                self.model.is_active,
                (self.model.start_date is None) | (self.model.start_date <= now),
                (self.model.end_date is None) | (self.model.end_date >= now),
            )
            .offset(skip)
            .limit(limit)
            .order_by(self.model.created_at)
        )
        return session.exec(statement).all()

    def get_count(self, session: Session, *, is_active: bool | None = None) -> int:
        """Get the total count of promotions, optionally filtered by active status."""
        # Implement count logic similar to CRUDGame.get_count
        # from sqlmodel import func
        # statement = select(func.count()).select_from(PromotionItem)
        # if is_active is not None:
        #     statement = statement.where(PromotionItem.is_active == is_active)
        # count = session.exec(statement).scalar_one_or_none() or 0
        # return count

        # Simpler count for now:
        results = self.get_multi(
            session=session, is_active=is_active, limit=1_000_000
        )  # Fetch all
        return len(results)

    def create(self, session: Session, *, obj_in: Any) -> PromotionItem:
        """Create a new promotion.

        Expects obj_in to be a schema like PromotionCreate.
        """
        # Check if code already exists
        existing = self.get_by_code(session, code=obj_in.code)
        if existing:
            # Or handle differently, e.g., raise HTTPException in the endpoint
            raise ValueError(f"Promotion code '{obj_in.code}' already exists.")

        db_obj = self.model.model_validate(obj_in)  # Create model instance

        # Generate and assign prefixed ID before adding to session
        generated_id = f"promo_{uuid.uuid4().hex[:8]}"
        db_obj.id = generated_id

        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def update(
        self, session: Session, *, id: str, obj_in: PromotionUpdateRow
    ) -> PromotionItem | None:
        """Update an existing promotion."""
        db_obj = self.get(session, id=id)
        if not db_obj:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)

        # Check if the code is being changed and if the new code already exists
        if "code" in update_data and update_data["code"] != db_obj.code:
            existing = self.get_by_code(session, code=update_data["code"])
            if existing:
                raise ValueError(
                    f"Promotion code '{update_data['code']}' already exists."
                )

        db_obj.sqlmodel_update(update_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def remove(self, session: Session, *, id: str) -> PromotionItem | None:
        """Remove a promotion."""
        obj = self.get(session, id=id)
        if obj:
            session.delete(obj)
            session.commit()
        return obj


# Instantiate CRUD object
promotion = CRUDPromotion(PromotionItem)
