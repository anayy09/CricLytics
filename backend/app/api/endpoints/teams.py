from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.db import models
from app.services import team_service

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_teams(db: Session = Depends(get_db)):
    """Get all teams"""
    teams = db.query(models.Team).all()
    return [team_service.team_to_dict(team) for team in teams]

@router.get("/{team_id}", response_model=Dict[str, Any])
async def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get team by ID"""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team_service.team_to_dict(team, include_players=True)

@router.get("/{team_id}/matches", response_model=List[Dict[str, Any]])
async def get_team_matches(team_id: int, db: Session = Depends(get_db)):
    """Get matches for a team"""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    matches = db.query(models.Match).filter(
        (models.Match.home_team_id == team_id) | (models.Match.away_team_id == team_id)
    ).all()
    
    return [team_service.match_to_dict(match) for match in matches]

@router.get("/{team_id}/stats", response_model=Dict[str, Any])
async def get_team_stats(team_id: int, db: Session = Depends(get_db)):
    """Get detailed stats for a team"""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return team_service.get_team_stats(team_id, db)

@router.get("/head-to-head/{team1_id}/{team2_id}", response_model=Dict[str, Any])
async def get_head_to_head(team1_id: int, team2_id: int, db: Session = Depends(get_db)):
    """Get head-to-head stats between two teams"""
    team1 = db.query(models.Team).filter(models.Team.id == team1_id).first()
    team2 = db.query(models.Team).filter(models.Team.id == team2_id).first()
    
    if not team1 or not team2:
        raise HTTPException(status_code=404, detail="One or both teams not found")
    
    return team_service.get_head_to_head_stats(team1_id, team2_id, db)