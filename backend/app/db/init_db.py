import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models import *  # Import all models so Base sees them
from app.services.data_processor import initialize_database
from app.db.database import Base

async def init() -> None:
    """Initialize database with initial data"""
    
    # 🛠 Create tables first
    Base.metadata.create_all(bind=engine)

    # 👇 Now proceed with any initial data insertion
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
    print("Database initialized successfully!")