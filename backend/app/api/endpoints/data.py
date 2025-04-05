from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.services.data_processor import (
    process_team_data,
    process_player_data,
    process_match_data,
    process_historical_data,
    initialize_database
)

router = APIRouter()

@router.post("/initialize", status_code=202)
async def initialize_data(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Initialize database with data from APIs"""
    background_tasks.add_task(initialize_database, db)
    return {"message": "Data initialization started in background"}

@router.post("/refresh/teams", status_code=202)
async def refresh_team_data(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Refresh team data from API"""
    background_tasks.add_task(process_team_data, db)
    return {"message": "Team data refresh started in background"}

@router.post("/refresh/players", status_code=202)
async def refresh_player_data(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Refresh player data from API"""
    background_tasks.add_task(process_player_data, db)
    return {"message": "Player data refresh started in background"}

@router.post("/refresh/matches", status_code=202)
async def refresh_match_data(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Refresh match data from API"""
    background_tasks.add_task(process_match_data, db)
    return {"message": "Match data refresh started in background"}

@router.post("/refresh/historical", status_code=202)
async def refresh_historical_data(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Refresh historical data from Cricsheet"""
    background_tasks.add_task(process_historical_data, db)
    return {"message": "Historical data refresh started in background"}