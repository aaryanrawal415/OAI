from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.authentication.security import authenticate_user, create_access_token
from datetime import timedelta

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=dict)
async def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer"}
