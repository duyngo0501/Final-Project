from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

# Import the correct Admin dependency from deps.py
from app.api.deps import AdminUser  # Import AdminUser and SessionDep
from app.core.db import get_db  # Assuming get_db is defined in app/core/db.py
from app.models.promotion import Promotion
from app.schemas.promotion import PromotionCreate, PromotionResponse, PromotionUpdate

# Remove incorrect import
# from app.auth.dependencies import admin_required
# from app.models.user import User # User model now likely comes via AdminUser/CurrentUser

router = APIRouter()


@router.post(
    "/",
    response_model=PromotionResponse,
    status_code=status.HTTP_201_CREATED,
    # Use the AdminUser dependency
    # dependencies=[Depends(admin_required)] # Old way
)
def create_promotion(
    promotion_in: PromotionCreate,
    current_admin_user: AdminUser,  # FIX: Moved before db
    db: Session = Depends(get_db),  # Or use db: SessionDep
):
    """
    Create a new promotion (Admin only).
    Requires admin privileges verified by AdminUser dependency.
    """
    # Check if code already exists
    existing_promotion = (
        db.query(Promotion).filter(Promotion.code == promotion_in.code).first()
    )
    if existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Promotion code '{promotion_in.code}' already exists.",
        )

    db_promotion = Promotion(**promotion_in.dict())
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    return db_promotion


@router.get("/", response_model=list[PromotionResponse])
def read_promotions(
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of promotions, optionally filtered by active status.
    """
    query = db.query(Promotion)
    if is_active is not None:
        query = query.filter(Promotion.is_active == is_active)

    promotions = query.offset(skip).limit(limit).all()
    return promotions


@router.get("/{promotion_id}", response_model=PromotionResponse)
def read_promotion(promotion_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific promotion by its ID.
    """
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if db_promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )
    return db_promotion


@router.put(
    "/{promotion_id}",
    response_model=PromotionResponse,
    # Use the AdminUser dependency
    # dependencies=[Depends(admin_required)] # Old way
)
def update_promotion(
    promotion_id: str,
    promotion_in: PromotionUpdate,
    current_admin_user: AdminUser,  # FIX: Moved before db
    db: Session = Depends(get_db),  # Or use db: SessionDep
):
    """
    Update an existing promotion (Admin only).
    Requires admin privileges verified by AdminUser dependency.
    """
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if db_promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )

    # Check for code collision if code is being updated
    if promotion_in.code and promotion_in.code != db_promotion.code:
        existing = (
            db.query(Promotion).filter(Promotion.code == promotion_in.code).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Promotion code '{promotion_in.code}' already exists.",
            )

    update_data = promotion_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_promotion, key, value)

    db.commit()
    db.refresh(db_promotion)
    return db_promotion


@router.delete(
    "/{promotion_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    # Use the AdminUser dependency
    # dependencies=[Depends(admin_required)] # Old way
)
def delete_promotion(
    promotion_id: str,
    current_admin_user: AdminUser,  # FIX: Moved before db
    db: Session = Depends(get_db),  # Or use db: SessionDep
):
    """
    Delete a promotion (Admin only).
    Requires admin privileges verified by AdminUser dependency.
    """
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if db_promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )

    db.delete(db_promotion)
    db.commit()
    return None  # Return None for 204 status code
