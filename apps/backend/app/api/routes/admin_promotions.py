from collections.abc import Sequence

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import AdminUser, SessionDep
from app.crud import crud_promotion
from app.schemas.promotion import Promotion, PromotionCreate, PromotionUpdate

# Note: This router will be included under a path like /api/v1/admin/promotions
router = APIRouter()


@router.post(
    "/",
    response_model=Promotion,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(AdminUser)],  # Protect endpoint
)
async def create_promotion(
    promotion_in: PromotionCreate, session: SessionDep
) -> Promotion:
    """Admin: Create a new promotion.

    Requires admin privileges.
    Checks for duplicate promotion codes.

    Args:
        promotion_in: The promotion details.
        session: Database session dependency.

    Returns:
        The created promotion.

    Raises:
        HTTPException (400): If the promotion code already exists.
    """
    try:
        promotion = crud_promotion.promotion.create(
            session=session, obj_in=promotion_in
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return promotion


@router.get("/", response_model=Sequence[Promotion], dependencies=[Depends(AdminUser)])
async def read_promotions(
    session: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
) -> Sequence[Promotion]:
    """Admin: Retrieve all promotions with pagination.

    Requires admin privileges.

    Args:
        session: Database session dependency.
        skip: Number of records to skip.
        limit: Maximum number of records to return.

    Returns:
        A list of promotions.
    """
    promotions = crud_promotion.promotion.get_multi(session, skip=skip, limit=limit)
    return promotions


@router.get("/{id}", response_model=Promotion, dependencies=[Depends(AdminUser)])
async def read_promotion(id: str, session: SessionDep) -> Promotion:
    """Admin: Get a specific promotion by its ID.

    Requires admin privileges.

    Args:
        id: The ID string of the promotion.
        session: Database session dependency.

    Returns:
        The promotion details.

    Raises:
        HTTPException (404): If the promotion is not found.
    """
    promotion = crud_promotion.promotion.get(session, id=id)
    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )
    return promotion


@router.put("/{id}", response_model=Promotion, dependencies=[Depends(AdminUser)])
async def update_promotion(
    id: str, promotion_in: PromotionUpdate, session: SessionDep
) -> Promotion:
    """Admin: Update an existing promotion.

    Requires admin privileges.
    Checks for duplicate promotion codes if the code is being changed.

    Args:
        id: The ID string of the promotion to update.
        promotion_in: The updated promotion details (partial updates allowed).
        session: Database session dependency.

    Returns:
        The updated promotion.

    Raises:
        HTTPException (404): If the promotion is not found.
        HTTPException (400): If the new promotion code already exists.
    """
    try:
        updated_promotion = crud_promotion.promotion.update(
            session=session, id=id, obj_in=promotion_in
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not updated_promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )
    return updated_promotion


@router.delete(
    "/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(AdminUser)]
)
async def delete_promotion(id: str, session: SessionDep) -> None:
    """Admin: Delete a promotion.

    Requires admin privileges.

    Args:
        id: The ID string of the promotion to delete.
        session: Database session dependency.

    Returns:
        None. Returns 204 No Content on success.

    Raises:
        HTTPException (404): If the promotion is not found.
    """
    deleted_promotion = crud_promotion.promotion.remove(session=session, id=id)
    if not deleted_promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found"
        )
    return None
