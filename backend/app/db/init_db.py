import asyncio
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.services.data_processor import initialize_database

async def init() -> None:
    """Initialize database with initial data"""
    db = SessionLocal()
    try:
        await initialize_database(db)
    finally:
        db.close()

def init_db() -> None:
    """Run database initialization"""
    asyncio.run(init())

if __name__ == "__main__":
    init_db()