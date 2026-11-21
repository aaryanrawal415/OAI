import yaml
import os
from pathlib import Path
from pydantic import BaseSettings

# Resolve absolute path to the project's root .env (two levels up)
_project_root = Path(__file__).resolve().parents[2]
_env_path = _project_root / ".env"

class Settings(BaseSettings):
    class Config:
        env_file = str(_env_path)
        env_file_encoding = "utf-8"
        # Load defaults from default.yaml if exists
        @classmethod
        def customise_sources(cls, init_settings, env_settings, file_secret_settings):
            return (
                init_settings,
                env_settings,
                lambda settings: yaml.safe_load(open(_project_root / "default.yaml")) if os.path.exists(_project_root / "default.yaml") else {},
                file_secret_settings,
            )

settings = Settings()
