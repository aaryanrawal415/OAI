"""Health check endpoint for the OptiFreight AI backend.
Returns a simple JSON indicating the service status.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/ping")
async def ping():
    return {"status": "ok"}
