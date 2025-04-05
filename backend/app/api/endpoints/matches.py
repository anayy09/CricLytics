from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.db.database import get_db
from app.db import models
from app.services import match_service

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_matches(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    team_id: Optional[int] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Get all matches with optional filtering
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Filter by match status (Scheduled, Live, Completed, Abandoned)
        team_id: Filter by team ID
        from_date: Filter matches after this date
        to_date: Filter matches before this date
    """
    query = db.query(models.Match)
    
    if status:
        query = query.filter(models.Match.match_status == status)
    
    if team_id:
        query = query.filter(
            (models.Match.home_team_id == team_id) | (models.Match.away_team_id == team_id)
        )
    
    if from_date:
        query = query.filter(models.Match.date >= from_date)
    
    if to_date:
        query = query.filter(models.Match.date <= to_date)
    
    matches = query.order_by(models.Match.date).offset(skip).limit(limit).all()
    return [match_service.match_to_dict(match) for match in matches]

@router.get("/live", response_model=List[Dict[str, Any]])
async def get_live_matches(db: Session = Depends(get_db)):
    """Get currently live matches"""
    matches = db.query(models.Match).filter(models.Match.match_status == "Live").all()
    return [match_service.match_to_dict(match, include_commentary=True) for match in matches]

@router.get("/upcoming", response_model=List[Dict[str, Any]])
async def get_upcoming_matches(days: int = 7, db: Session = Depends(get_db)):
    """
    Get upcoming matches
    
    Args:
        days: Number of days to look ahead
    """
    today = datetime.now().date()
    end_date = today + timedelta(days=days)
    
    matches = db.query(models.Match).filter(
        models.Match.match_status == "Scheduled",
        models.Match.date >= today,
        models.Match.date <= end_date
    ).order_by(models.Match.date).all()
    
    return [match_service.match_to_dict(match) for match in matches]

@router.get("/recent", response_model=List[Dict[str, Any]])
async def get_recent_matches(days: int = 7, db: Session = Depends(get_db)):
    """
    Get recently completed matches
    
    Args:
        days: Number of days to look back
    """
    today = datetime.now().date()
    start_date = today - timedelta(days=days)
    
    matches = db.query(models.Match).filter(
        models.Match.match_status == "Completed",
        models.Match.date >= start_date,
        models.Match.date <= today
    ).order_by(models.Match.date.desc()).all()
    
    return [match_service.match_to_dict(match) for match in matches]

@router.get("/{match_id}", response_model=Dict[str, Any])
async def get_match(match_id: int, db: Session = Depends(get_db)):
    """Get match by ID"""
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match_service.match_to_dict(match, include_commentary=True, include_performances=True)

@router.get("/{match_id}/commentary", response_model=List[Dict[str, Any]])
async def get_match_commentary(match_id: int, db: Session = Depends(get_db)):
    """Get commentary for a match"""
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    commentary = db.query(models.Commentary).filter(
        models.Commentary.match_id == match_id
    ).order_by(models.Commentary.innings_number, models.Commentary.over_number, models.Commentary.ball_number).all()
    
    return [match_service.commentary_to_dict(comment) for comment in commentary]

@router.get("/{match_id}/win-probability", response_model=Dict[str, Any])
async def get_win_probability(match_id: int, db: Session = Depends(get_db)):
    """Get win probability for a live match"""
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.match_status != "Live":
        raise HTTPException(status_code=400, detail="Win probability only available for live matches")
    
    return match_service.calculate_win_probability(match, db)