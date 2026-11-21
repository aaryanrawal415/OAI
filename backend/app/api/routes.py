# FastAPI routes for OptiFreight AI

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas import UnctadDataRequest, UnctadDataResponse
from app.services.unctad import fetch_unctad_data

router = APIRouter()

@router.post("/unctad", response_model=UnctadDataResponse)
async def get_unctad_data(request: UnctadDataRequest, db: AsyncSession = Depends(get_db)):
    try:
        data = await fetch_unctad_data(request, db)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
