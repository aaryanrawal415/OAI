import asyncio, asyncpg, os
from pathlib import Path

# Resolve root .env
project_root = Path(__file__).resolve().parents[2]
env_path = project_root / '.env'
# Load env manually (fallback if pydantic not used)
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.strip() and not line.startswith('#') and '=' in line:
            key, val = line.split('=', 1)
            os.environ.setdefault(key.strip(), val.strip())

DATABASE_URL = os.getenv('DATABASE_URL')
print('Attempting connection...')
async def test():
    try:
        conn = await asyncpg.connect(DATABASE_URL, timeout=5)
        await conn.close()
        print('SUCCESS')
    except Exception as e:
        print('FAIL', type(e).__name__, str(e))

asyncio.run(test())
