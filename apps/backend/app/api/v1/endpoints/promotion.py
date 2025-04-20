from collections.abc import Sequence

from fastapi import APIRouter, Depends, Query

from app.api.deps import CurrentUser, SessionDep  # Need CurrentUser for auth
from app.crud import crud_promotion
from app.schemas.promotion import Promotion

router = APIRouter()


@router.get(
    "/",
    response_model=Sequence[Promotion],
    dependencies=[Depends(CurrentUser)],  # Require login
)
async def list_active_promotions(
    session: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
) -> Sequence[Promotion]:
    """List currently active promotions available to users.

    Retrieves promotions that are marked active and fall within their
    start and end dates (if specified).
    Requires the user to be logged in.

    Args:
        session: Database session dependency.
        skip: Number of records to skip.
        limit: Maximum number of records to return.

    Returns:
        A list of active promotions.
    """
    promotions = crud_promotion.promotion.get_multi_active(
        session, skip=skip, limit=limit
    )
    return promotions
