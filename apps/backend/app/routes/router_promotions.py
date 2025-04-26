import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import (
    Session,
)  # Keep Session for type hint if needed, but use SessionDep for dependency

# Import the correct Admin dependency from deps.py
from app.core.deps import AdminUser, SessionDep  # Use SessionDep

# Remove old get_db import if SessionDep is used
# from app.core.db import get_db
from app.schemas.db_promotion import (
    Promotion,
    PromotionCreateRow,
    PromotionResponse,
    PromotionUpdateRow,
)
from app.dal import promotion as promotion_dal  # Import DAL object

router = APIRouter()


@router.post(
    "/",
    response_model=PromotionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_promotion(
    promotion_in: PromotionCreateRow,
    session: SessionDep,
    current_admin_user: AdminUser,
):
    """
    Create a new promotion (Admin only).
    Requires admin privileges verified by AdminUser dependency.
    """
    # Use DAL
    existing_promotion = promotion_dal.get_by_code(session, code=promotion_in.code)
    if existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Promotion code '{promotion_in.code}' already exists.",
        )

    db_promotion = promotion_dal.create(session, obj_in=promotion_in)
    # No explicit commit/refresh needed
    return db_promotion


@router.get("/", response_model=list[PromotionResponse])
def read_promotions(
    # SessionDep first (no default value)
    session: SessionDep,
    # Parameters with defaults last
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = Query(None, description="Filter by active status"),
):
    """
    Retrieve a list of promotions, optionally filtered by active status.
    """
    # Use DAL
    promotions = promotion_dal.get_multi(
        session, skip=skip, limit=limit, is_active=is_active
    )
    return promotions


@router.get("/{promotion_id}", response_model=PromotionResponse)
def read_promotion(
    promotion_id: uuid.UUID, session: SessionDep
):  # Use SessionDep and UUID
    """
    Retrieve a specific promotion by its ID.
    """
    # Use DAL
    db_promotion = promotion_dal.get(session, id=promotion_id)
    if db_promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )
    return db_promotion


@router.put(
    "/{promotion_id}",
    response_model=PromotionResponse,
)
def update_promotion(
    promotion_id: uuid.UUID,
    promotion_in: PromotionUpdateRow,
    session: SessionDep,
    current_admin_user: AdminUser,
):
    """
    Update an existing promotion (Admin only).
    Requires admin privileges verified by AdminUser dependency.
    """
    # Use DAL
    db_promotion = promotion_dal.get(session, id=promotion_id)
    if db_promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )

    # Check for code collision if code is being updated
    if promotion_in.code and promotion_in.code != db_promotion.code:
        existing = promotion_dal.get_by_code(session, code=promotion_in.code)
        # Ensure the existing one found isn't the one we are currently updating
        if existing and existing.id != promotion_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Promotion code '{promotion_in.code}' already exists.",
            )

    updated_promotion = promotion_dal.update(
        session, db_obj=db_promotion, obj_in=promotion_in
    )
    # No explicit commit/refresh needed
    return updated_promotion


@router.delete(
    "/{promotion_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_promotion(
    promotion_id: uuid.UUID,
    session: SessionDep,
    current_admin_user: AdminUser,
):
    """
    Delete a promotion (Admin only).
    Requires admin privileges verified by AdminUser dependency.
    """
    # Use DAL
    db_promotion = promotion_dal.get(session, id=promotion_id)
    if db_promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )

    promotion_dal.remove(session, id=promotion_id)
    # No explicit commit needed
    return None  # Return None for 204 status code
