from typing import Dict, Any, List, Optional, Union
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from datetime import datetime, time, date

from app.db import models
from app.utils.data_fetcher import (
    fetch_match_schedule,
    fetch_team_standings,
    fetch_top_run_scorers,
    fetch_most_wickets,
    download_cricsheet_data
)

def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float"""
    if not value or value == '-':
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert value to int"""
    if not value or value == '-':
        return default
    try:
        return int(str(value).split('*')[0])  # Handle "50*" format
    except (ValueError, TypeError):
        return default

def clean_player_code(code: str) -> str:
    """Clean and standardize player code"""
    if not code:
        return ""
    # Remove any potential duplicates in the code
    parts = code.split('-')
    if len(parts) > 1:
        return f"{parts[0]}-{parts[-1]}"
    return code

def clean_match_code(match_id: Any) -> str:
    """Clean and standardize match code"""
    if not match_id:
        return ""
    return str(match_id).strip()

async def process_team_data(db: Session) -> List[models.Team]:
    """
    Process team data from the API and store in database
    
    Args:
        db: Database session
        
    Returns:
        List of team models
    """
    # Fetch team standings data
    team_data = await fetch_team_standings()
    teams = []
    
    for team_info in team_data.get("Teams", []):
        # Check if team already exists
        team = db.query(models.Team).filter(models.Team.team_code == team_info["TeamCode"]).first()
        
        if not team:
            # Create new team
            team = models.Team(
                team_code=team_info["TeamCode"],
                name=team_info["TeamName"],
                short_name=team_info["TeamCode"],
                logo_url=team_info.get("TeamLogo", ""),
                matches_played=int(team_info.get("Matches", 0)),
                matches_won=int(team_info.get("Wins", 0)),
                matches_lost=int(team_info.get("Loss", 0)),
                matches_tied=int(team_info.get("Tied", 0)),
                net_run_rate=float(team_info.get("NetRunRate", 0.0)),
                points=int(team_info.get("Points", 0))
            )
            db.add(team)
        else:
            # Update existing team
            team.matches_played = int(team_info.get("Matches", 0))
            team.matches_won = int(team_info.get("Wins", 0))
            team.matches_lost = int(team_info.get("Loss", 0))
            team.matches_tied = int(team_info.get("Tied", 0))
            team.net_run_rate = float(team_info.get("NetRunRate", 0.0))
            team.points = int(team_info.get("Points", 0))
        
        teams.append(team)
    
    db.commit()
    return teams

async def process_player_data(db: Session) -> List[models.Player]:
    """Process player data from the API and store in database"""
    batsmen_data = await fetch_top_run_scorers()
    bowlers_data = await fetch_most_wickets()
    players = []
    processed_codes = set()  # Track processed player codes
    
    # Process batsmen
    for player_info in batsmen_data.get("Batsmen", []):
        player_code = clean_player_code(player_info.get("StrikerID"))
        if not player_code or player_code in processed_codes:
            continue
        
        processed_codes.add(player_code)
        player = db.query(models.Player).filter(
            models.Player.player_code == player_code
        ).first()
        
        if not player:
            player = models.Player(
                player_code=player_code,
                name=player_info["StrikerName"],
                role="Batsman",
                matches=safe_int(player_info.get("Matches")),
                runs=safe_int(player_info.get("TotalRuns")),
                highest_score=safe_int(player_info.get("HighestScore")),
                fifties=safe_int(player_info.get("FiftyPlusRuns")),
                hundreds=safe_int(player_info.get("Centuries")),
                fours=safe_int(player_info.get("Fours")),
                sixes=safe_int(player_info.get("Sixes")),
                batting_average=safe_float(player_info.get("BattingAverage")),
                strike_rate=safe_float(player_info.get("StrikeRate"))
            )
            
            # Add player to team
            team_name = player_info.get("TeamName")
            if team_name:
                team = db.query(models.Team).filter(models.Team.name == team_name).first()
                if team:
                    player.teams.append(team)
            
            db.add(player)
            try:
                db.flush()  # Try to flush changes without committing
            except:
                db.rollback()  # Rollback if there's an error
                continue
        else:
            # Update existing player batting stats
            player.matches = max(player.matches, safe_int(player_info.get("Matches")))
            player.runs = safe_int(player_info.get("TotalRuns"))
            player.highest_score = safe_int(player_info.get("HighestScore"))
            player.fifties = safe_int(player_info.get("FiftyPlusRuns"))
            player.hundreds = safe_int(player_info.get("Centuries"))
            player.fours = safe_int(player_info.get("Fours"))
            player.sixes = safe_int(player_info.get("Sixes"))
            player.batting_average = safe_float(player_info.get("BattingAverage"))
            player.strike_rate = safe_float(player_info.get("StrikeRate"))
        
        players.append(player)
    
    # Process bowlers
    for player_info in bowlers_data.get("Bowlers", []):
        player_code = clean_player_code(player_info.get("BowlerID"))
        if not player_code or player_code in processed_codes:
            continue
            
        processed_codes.add(player_code)
        player = db.query(models.Player).filter(
            models.Player.player_code == player_code
        ).first()
        
        if not player:
            player = models.Player(
                player_code=player_code,
                name=player_info["BowlerName"],
                role="Bowler",
                matches=safe_int(player_info.get("Matches")),
                wickets=safe_int(player_info.get("Wickets")),
                best_bowling_figures=player_info.get("BBIW", ""),
                economy_rate=safe_float(player_info.get("EconomyRate")),
                bowling_average=safe_float(player_info.get("BowlingAverage")),
                bowling_strike_rate=safe_float(player_info.get("BowlingSR"))
            )
            
            # Add player to team
            team_name = player_info.get("TeamName")
            if team_name:
                team = db.query(models.Team).filter(models.Team.name == team_name).first()
                if team:
                    player.teams.append(team)
            
            db.add(player)
            try:
                db.flush()  # Try to flush changes without committing
            except:
                db.rollback()  # Rollback if there's an error
                continue
        else:
            # Update existing player bowling stats
            player.matches = max(player.matches, safe_int(player_info.get("Matches")))
            player.wickets = safe_int(player_info.get("Wickets"))
            player.best_bowling_figures = player_info.get("BBIW", "")
            player.economy_rate = safe_float(player_info.get("EconomyRate"))
            player.bowling_average = safe_float(player_info.get("BowlingAverage"))
            player.bowling_strike_rate = safe_float(player_info.get("BowlingSR"))
            
            if player.role == "Batsman":
                player.role = "All-rounder"
        
        if player not in players:
            players.append(player)
    
    try:
        db.commit()
    except:
        db.rollback()
        raise
    
    return players

async def process_match_data(db: Session) -> List[models.Match]:
    """
    Process match data from the API and store in database
    
    Args:
        db: Database session
        
    Returns:
        List of match models
    """
    # Fetch match schedule data
    match_data = await fetch_match_schedule()
    matches = []
    
    for match_info in match_data.get("Matches", []):
        # Ensure match_code is a string
        match_code = clean_match_code(match_info["MatchID"])
        
        # Check if match already exists
        match = db.query(models.Match).filter(models.Match.match_code == match_code).first()
        
        if not match:
            # Get team references by team names
            home_team = db.query(models.Team).filter(models.Team.name == match_info["HomeTeamName"]).first()
            away_team = db.query(models.Team).filter(models.Team.name == match_info["AwayTeamName"]).first()
            
            if not home_team or not away_team:
                continue  # Skip if teams not found
            
            # Parse match date and time
            try:
                match_datetime = datetime.strptime(f"{match_info['MatchDate']} {match_info['MatchTime']}", "%Y-%m-%d %H:%M")
            except (ValueError, KeyError):
                continue
            
            # Create new match - Remove match_type field as it's not in the model
            match = models.Match(
                match_code=match_code,
                season=match_info.get("CompetitionID", "203"),
                date=match_datetime,
                venue=match_info.get("GroundName", ""),
                home_team_id=home_team.id,
                away_team_id=away_team.id,
                match_status=match_info.get("MatchStatus", "Upcoming")
            )

            try:
                # Add match result if completed
                if match_info.get("Comments") and "Won by" in match_info["Comments"]:
                    winner_name = match_info["Comments"].split(" Won by")[0].strip()
                    winner = db.query(models.Team).filter(models.Team.name == winner_name).first()
                    
                    if winner:
                        match.winner_id = winner.id
                        comment_parts = match_info["Comments"].split(" Won by ")[1].split(" ")
                        match.win_margin = safe_int(comment_parts[0])
                        match.win_type = "Runs" if "Runs" in comment_parts[1] else "Wickets"
                
                # Add innings info if available
                if match_info.get("FirstBattingSummary"):
                    first_innings = match_info["FirstBattingSummary"].split(" - ")
                    if len(first_innings) == 2:
                        score, overs = first_innings
                        if "/" in score:
                            runs, wickets = score.split("/")
                            match.first_innings_score = safe_int(runs)
                            match.first_innings_wickets = safe_int(wickets)
                            match.first_innings_overs = safe_float(overs.replace(" Ovs", ""))
                
                if match_info.get("SecondBattingSummary"):
                    second_innings = match_info["SecondBattingSummary"].split(" - ")
                    if len(second_innings) == 2:
                        score, overs = second_innings
                        if "/" in score:
                            runs, wickets = score.split("/")
                            match.second_innings_score = safe_int(runs)
                            match.second_innings_wickets = safe_int(wickets)
                            match.second_innings_overs = safe_float(overs.replace(" Ovs", ""))
                
                db.add(match)
                db.flush()
            except Exception as e:
                print(f"Error processing match {match_code}: {str(e)}")
                db.rollback()
                continue
                
        matches.append(match)
    
    try:
        db.commit()
    except:
        db.rollback()
        raise
    
    return matches

async def process_historical_data(db: Session) -> None:
    """
    Process historical data from Cricsheet
    
    Args:
        db: Database session
    """
    # Download and extract Cricsheet data
    match_data = await download_cricsheet_data()
    
    for match in match_data:
        # Process each historical match
        # This is a simplified version - in a real implementation, you'd need to map
        # the Cricsheet data format to your database models
        
        info = match.get("info", {})   

        raw_date = info.get("dates", [""])[0]
        match_date = datetime.combine(raw_date, time.min) if isinstance(raw_date, date) else datetime.strptime(raw_date, "%Y-%m-%d")

        teams = info.get("teams", [])
        
        if len(teams) != 2:
            continue
        
        # Look for existing match on this date between these teams
        existing_matches = db.query(models.Match).filter(
            models.Match.date == match_date
        ).all()
        
        found = False
        for existing in existing_matches:
            home_team = db.query(models.Team).filter(models.Team.id == existing.home_team_id).first()
            away_team = db.query(models.Team).filter(models.Team.id == existing.away_team_id).first()
            
            if not home_team or not away_team:
                continue
                
            if (home_team.name in teams[0] and away_team.name in teams[1]) or \
               (home_team.name in teams[1] and away_team.name in teams[0]):
                found = True
                break
        
        if found:
            continue  # Skip if match already exists
        
        # Create teams if they don't exist
        team1 = db.query(models.Team).filter(models.Team.name.like(f"%{ teams[0]}%")).first()
        if not team1:
            team1 = models.Team(
                team_code=teams[0].replace(" ", "").upper(),
                name=teams[0],
                short_name=teams[0][:3].upper()
            )
            db.add(team1)
            db.flush()
        
        team2 = db.query(models.Team).filter(models.Team.name.like(f"%{teams[1]}%")).first()
        if not team2:
            team2 = models.Team(
                team_code=teams[1].replace(" ", "").upper(),
                name=teams[1],
                short_name=teams[1][:3].upper()
            )
            db.add(team2)
            db.flush()
        
        # Create match record
        new_match = models.Match(
            match_code=f"HIST-{match_date.strftime('%Y%m%d')}-{team1.team_code}-{team2.team_code}",
            season=str(match_date.year),
            date=match_date,
            venue=info.get("venue", ""),
            city=info.get("city", ""),
            home_team_id=team1.id,
            away_team_id=team2.id,
            match_status="Completed"
        )
        
        # Add toss info
        toss = info.get("toss", {})
        if toss:
            toss_winner = team1 if toss.get("winner") == teams[0] else team2
            new_match.toss_winner_id = toss_winner.id
            new_match.toss_decision = toss.get("decision", "")
        
        # Add result info
        outcome = info.get("outcome", {})
        if "winner" in outcome:
            winner = team1 if outcome["winner"] == teams[0] else team2
            new_match.winner_id = winner.id
            
            if "runs" in outcome.get("by", {}):
                new_match.win_type = "Runs"
                new_match.win_margin = outcome["by"]["runs"]
            elif "wickets" in outcome.get("by", {}):
                new_match.win_type = "Wickets"
                new_match.win_margin = outcome["by"]["wickets"]
        
        db.add(new_match)
    
    db.commit()

async def initialize_database(db: Session) -> None:
    """
    Initialize database with data from APIs
    
    Args:
        db: Database session
    """
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=db.bind)
    
    # Process team data
    await process_team_data(db)
    
    # Process player data
    await process_player_data(db)
    
    # Process match data
    await process_match_data(db)
    
    # Process historical data
    await process_historical_data(db)