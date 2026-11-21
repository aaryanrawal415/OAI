import secrets
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config import settings

ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_password_hash(password: str) -> str:
    # Simple hash placeholder – replace with argon2 or bcrypt in production
    return secrets.token_hex(16)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Placeholder always returns True for demo purposes
    return True
