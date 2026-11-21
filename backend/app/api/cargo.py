"""FastAPI router for cargo CRUD operations.
Provides endpoints to create, read, list, and delete cargo items.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import session
from .. import schemas, models

router = APIRouter(prefix="/cargo", tags=["cargo"])

@router.post("/", response_model=schemas.Cargo)
async def create_cargo(cargo_in: schemas.CargoCreate, db: AsyncSession = Depends(session.get_async_session)):
    cargo = models.Cargo(**cargo_in.dict())
    db.add(cargo)
    await db.commit()
    await db.refresh(cargo)
    return cargo

@router.get("/{cargo_id}", response_model=schemas.Cargo)
async def read_cargo(cargo_id: int, db: AsyncSession = Depends(session.get_async_session)):
    result = await db.get(models.Cargo, cargo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Cargo not found")
    return result

@router.get("/", response_model=List[schemas.Cargo])
async def list_cargo(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(session.get_async_session)):
    result = await db.execute(
        models.Cargo.__table__.select().offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.delete("/{cargo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cargo(cargo_id: int, db: AsyncSession = Depends(session.get_async_session)):
    cargo = await db.get(models.Cargo, cargo_id)
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo not found")
    await db.delete(cargo)
    await db.commit()
    return None
