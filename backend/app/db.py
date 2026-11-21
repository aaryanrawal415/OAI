import os
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create the async engine with a 5‑second connection timeout.
# The driver (psycopg) respects the "connect_timeout" parameter.
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL.replace("+psycopg", "+asyncpg"),
    echo=False,
    future=True,
    connect_args={"timeout": 5},
)

AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncSession:
    """FastAPI dependency – provides a fresh async session and ensures cleanup."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

