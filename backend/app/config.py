from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os
from pathlib import Path

class Settings(BaseSettings):
    # Core settings
    UNCTAD_CLIENT_ID: str = Field(default="demo_id")
    UNCTAD_CLIENT_SECRET: str = Field(default="demo_secret")
    DATABASE_URL: str = Field(default="postgresql+asyncpg://optifreight:change_me@localhost:5432/optifreight")
    JWT_SECRET_KEY: str = Field(default="supersecretjwt")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Resolve absolute path to the project's root .env (two levels up from this file)
    _project_root = Path(__file__).resolve().parents[2]
    _env_path = _project_root / ".env"

    model_config = SettingsConfigDict(
        env_file=str(_env_path),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

