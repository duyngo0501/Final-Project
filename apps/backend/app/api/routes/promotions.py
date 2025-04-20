from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from app.models.promotion import Promotion
from app.database import get_db # Assuming get_db dependency
# Assuming an auth dependency that verifies admin role
from app.auth.dependencies import admin_required 
from app.models.user import User # Needed for the dependency

router = APIRouter()

@router.post(
    "/", 
    response_model=PromotionResponse, 
    status_code=status.HTTP_201_CREATED, 
    dependencies=[Depends(admin_required)] # Protect endpoint
)
def create_promotion(
    promotion_in: PromotionCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new promotion (Admin only).
    """
    # Check if code already exists
    existing_promotion = db.query(Promotion).filter(Promotion.code == promotion_in.code).first()
    if existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Promotion code '{promotion_in.code}' already exists."
        )
    
    db_promotion = Promotion(**promotion_in.dict())
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    return db_promotion

@router.get("/", response_model=List[PromotionResponse])
def read_promotions(
    skip: int = 0,
    limit: int = 100, 
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
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
def read_promotion(
    promotion_id: int, 
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific promotion by its ID.
    """
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if db_promotion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found")
    return db_promotion

@router.put(
    "/{promotion_id}", 
    response_model=PromotionResponse, 
    dependencies=[Depends(admin_required)] # Protect endpoint
)
def update_promotion(
    promotion_id: int, 
    promotion_in: PromotionUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing promotion (Admin only).
    """
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if db_promotion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found")

    # Check for code collision if code is being updated
    if promotion_in.code and promotion_in.code != db_promotion.code:
        existing = db.query(Promotion).filter(Promotion.code == promotion_in.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Promotion code '{promotion_in.code}' already exists."
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
    dependencies=[Depends(admin_required)] # Protect endpoint
)
def delete_promotion(
    promotion_id: int, 
    db: Session = Depends(get_db)
):
    """
    Delete a promotion (Admin only).
    """
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if db_promotion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found")
    
    db.delete(db_promotion)
    db.commit()
    return None # Return None for 204 status code 