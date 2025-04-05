from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.db import models
from app.services import prediction_service

router = APIRouter()

@router.get("/match/{match_id}", response_model=Dict[str, Any])
async def predict_match_outcome(match_id: int, db: Session = Depends(get_db)):
    """Predict outcome for an upcoming match"""
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.match_status != "Scheduled":
        raise HTTPException(status_code=400, detail="Predictions only available for scheduled matches")
    
    return await prediction_service.predict_match_outcome(match, db)

@router.get("/playoffs", response_model=Dict[str, Any])
async def predict_playoff_chances(db: Session = Depends(get_db)):
    """Predict playoff chances for all teams"""
    return await prediction_service.predict_playoff_chances(db)

@router.get("/simulate-season", response_model=Dict[str, Any])
async def simulate_season(simulations: int = 1000, db: Session = Depends(get_db)):
    """
    Simulate the remainder of the season
    
    Args:
        simulations: Number of simulations to run
    """
    return await prediction_service.simulate_season(simulations, db)

@router.get("/player-performance/{player_id}", response_model=Dict[str, Any])
async def predict_player_performance(player_id: int, match_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Predict performance for a player
    
    Args:
        player_id: Player ID
        match_id: Optional match ID for context-specific prediction
    """
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    match = None
    if match_id:
        match = db.query(models.Match).filter(models.Match.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
    
    return await prediction_service.predict_player_performance(player, match, db)