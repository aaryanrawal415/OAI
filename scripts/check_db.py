import asyncio
import sys, os
# Ensure backend is on PYTHONPATH regardless of cwd
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(project_root, 'backend'))
from app.db import engine

async def check_db():
    try:
        async with engine.begin() as conn:
            result = await conn.execute("SELECT 1")
            print('Connection OK, test query result:', [row[0] for row in result])
    except Exception as e:
        print('Database connection error:', type(e).__name__, str(e))

if __name__ == '__main__':
    asyncio.run(check_db())
