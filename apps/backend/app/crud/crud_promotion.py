import uuid
from collections.abc import Sequence
from datetime import datetime

from sqlmodel import Session, select

from app.models.promotion import Promotion
from app.schemas.promotion import PromotionCreate, PromotionUpdate


class CRUDPromotion:
    """CRUD operations for Promotion model."""

    def __init__(self, model: type[Promotion]):
        self.model = model

    def get(self, session: Session, *, id: uuid.UUID) -> Promotion | None:
        """Get a single promotion by id."""
        statement = select(self.model).where(self.model.id == id)
        return session.exec(statement).one_or_none()

    def get_by_code(self, session: Session, *, code: str) -> Promotion | None:
        """Get a single promotion by its unique code."""
        statement = select(self.model).where(self.model.code == code)
        return session.exec(statement).one_or_none()

    def get_multi(
        self, session: Session, *, skip: int = 0, limit: int = 100
    ) -> Sequence[Promotion]:
        """Get multiple promotions with pagination (all promotions)."""
        statement = select(self.model).offset(skip).limit(limit).order_by(self.model.created_at)
        return session.exec(statement).all()

    def get_multi_active(
        self, session: Session, *, skip: int = 0, limit: int = 100
    ) -> Sequence[Promotion]:
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

    def create(self, session: Session, *, obj_in: PromotionCreate) -> Promotion:
        """Create a new promotion."""
        # Check if code already exists
        existing = self.get_by_code(session, code=obj_in.code)
        if existing:
            # Or handle differently, e.g., raise HTTPException in the endpoint
            raise ValueError(f"Promotion code '{obj_in.code}' already exists.")

        db_obj = self.model.model_validate(obj_in) # Use model_validate for Pydantic v2
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def update(
        self, session: Session, *, id: uuid.UUID, obj_in: PromotionUpdate
    ) -> Promotion | None:
        """Update an existing promotion."""
        db_obj = self.get(session, id=id)
        if not db_obj:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)

        # Check if the code is being changed and if the new code already exists
        if "code" in update_data and update_data["code"] != db_obj.code:
            existing = self.get_by_code(session, code=update_data["code"])
            if existing:
                raise ValueError(f"Promotion code '{update_data['code']}' already exists.")

        db_obj.sqlmodel_update(update_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def remove(self, session: Session, *, id: uuid.UUID) -> Promotion | None:
        """Remove a promotion."""
        obj = self.get(session, id=id)
        if obj:
            session.delete(obj)
            session.commit()
        return obj


# Instantiate CRUD object
promotion = CRUDPromotion(Promotion) 
