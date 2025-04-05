from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.db import models
from app.services import player_service

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_players(
    skip: int = 0, 
    limit: int = 100,
    role: Optional[str] = None,
    team_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all players with optional filtering
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        role: Filter by player role (Batsman, Bowler, All-rounder, Wicket-keeper)
        team_id: Filter by team ID
    """
    query = db.query(models.Player)
    
    if role:
        query = query.filter(models.Player.role == role)
    
    if team_id:
        query = query.join(models.player_team_association).filter(
            models.player_team_association.c.team_id == team_id
        )
    
    players = query.offset(skip).limit(limit).all()
    return [player_service.player_to_dict(player) for player in players]

@router.get("/top-batsmen", response_model=List[Dict[str, Any]])
async def get_top_batsmen(limit: int = 10, db: Session = Depends(get_db)):
    """Get top batsmen by runs scored"""
    players = db.query(models.Player).order_by(models.Player.runs.desc()).limit(limit).all()
    return [player_service.player_to_dict(player) for player in players]

@router.get("/top-bowlers", response_model=List[Dict[str, Any]])
async def get_top_bowlers(limit: int = 10, db: Session = Depends(get_db)):
    """Get top bowlers by wickets taken"""
    players = db.query(models.Player).order_by(models.Player.wickets.desc()).limit(limit).all()
    return [player_service.player_to_dict(player) for player in players]

@router.get("/{player_id}", response_model=Dict[str, Any])
async def get_player(player_id: int, db: Session = Depends(get_db)):
    """Get player by ID"""
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player_service.player_to_dict(player, include_performances=True)

@router.get("/{player_id}/matches", response_model=List[Dict[str, Any]])
async def get_player_matches(player_id: int, db: Session = Depends(get_db)):
    """Get matches for a player"""
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get batting performances
    batting_performances = db.query(models.BattingPerformance).filter(
        models.BattingPerformance.player_id == player_id
    ).all()
    
    # Get bowling performances
    bowling_performances = db.query(models.BowlingPerformance).filter(
        models.BowlingPerformance.player_id == player_id
    ).all()
    
    # Get unique match IDs
    match_ids = set()
    for perf in batting_performances:
        innings = db.query(models.Innings).filter(models.Innings.id == perf.innings_id).first()
        if innings:
            match_ids.add(innings.match_id)
    
    for perf in bowling_performances:
        innings = db.query(models.Innings).filter(models.Innings.id == perf.innings_id).first()
        if innings:
            match_ids.add(innings.match_id)
    
    # Get match details
    matches = db.query(models.Match).filter(models.Match.id.in_(match_ids)).all()
    
    return [player_service.match_to_dict(match) for match in matches]

@router.get("/{player_id}/stats", response_model=Dict[str, Any])
async def get_player_stats(player_id: int, db: Session = Depends(get_db)):
    """Get detailed stats for a player"""
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return player_service.get_player_stats(player_id, db)