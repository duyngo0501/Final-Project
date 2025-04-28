from fastapi import APIRouter

router = APIRouter()


@router.get("/health-check/", operation_id="UtilsController_healthCheck")
async def health_check() -> bool:
    return True
