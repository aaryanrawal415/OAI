import asyncio
import sys, os
# Ensure backend is on PYTHONPATH regardless of cwd
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(project_root, 'backend'))
from app.db import engine

async def list_tables():
    try:
        async with engine.begin() as conn:
            result = await conn.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
            tables = [row[0] for row in result]
            print('Tables:', tables)
    except Exception as e:
        print('Error listing tables:', type(e).__name__, str(e))

if __name__ == '__main__':
    asyncio.run(list_tables())
