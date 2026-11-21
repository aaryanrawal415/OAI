import sys, os, pathlib
project_root = pathlib.Path(__file__).resolve().parents[1]
sys.path.append(str(project_root / 'backend'))
from app.config import settings
from psycopg import connect, OperationalError

def main():
    dsn = settings.DATABASE_URL.replace('postgresql+asyncpg', 'postgresql').replace('postgresql+psycopg', 'postgresql')
    try:
        with connect(dsn, connect_timeout=5) as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT 1')
                result = cur.fetchone()
                print('Connection OK, result:', result)
    except OperationalError as e:
        print('Database connection error:', type(e).__name__, e)

if __name__ == '__main__':
    main()
