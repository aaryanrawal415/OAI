import sys, os, pathlib
project_root = pathlib.Path(__file__).resolve().parents[1]
sys.path.append(str(project_root / 'backend'))
from app.config import settings
print('DB URL:', settings.DATABASE_URL)
