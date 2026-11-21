import asyncio, sys, os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(project_root, 'backend'))
from app.db import engine
async def main():
    try:
        async with engine.begin() as conn:
            result = await conn.execute('SELECT 1')
            print('Connection OK, result:', [row[0] for row in result])
    except Exception as e:
        print('Error:', type(e).__name__, e)
if __name__ == '__main__':
    asyncio.run(main())
