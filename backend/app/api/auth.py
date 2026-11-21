"""FastAPI router for authentication endpoints.
Provides login, token refresh and user registration.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from ..authentication import security, schemas
from ..database import models, session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(session.get_async_session)):
    user = await security.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = security.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.User)
async def register(user_in: schemas.UserCreate, db: AsyncSession = Depends(session.get_async_session)):
    existing = await security.get_user_by_username(db, user_in.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = await security.create_user(db, user_in)
    return user
