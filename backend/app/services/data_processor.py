from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from datetime import datetime

from app.db import models
from app.utils.data_fetcher import (
    fetch_match_schedule,
    fetch_team_standings,
    fetch_top_run_scorers,
    fetch_most_wickets,
    download_cricsheet_data
)

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
                name=team_info["FullName"],
                short_name=team_info["ShortName"],
                logo_url=team_info.get("TeamLogo", ""),
                primary_color=team_info.get("PrimaryColor", "#000000"),
                secondary_color=team_info.get("SecondaryColor", "#FFFFFF"),
                matches_played=int(team_info.get("Matches", 0)),
                matches_won=int(team_info.get("Won", 0)),
                matches_lost=int(team_info.get("Lost", 0)),
                matches_tied=int(team_info.get("Tied", 0)),
                net_run_rate=float(team_info.get("NetRunRate", 0.0)),
                points=int(team_info.get("Points", 0))
            )
            db.add(team)
        else:
            # Update existing team
            team.matches_played = int(team_info.get("Matches", 0))
            team.matches_won = int(team_info.get("Won", 0))
            team.matches_lost = int(team_info.get("Lost", 0))
            team.matches_tied = int(team_info.get("Tied", 0))
            team.net_run_rate = float(team_info.get("NetRunRate", 0.0))
            team.points = int(team_info.get("Points", 0))
        
        teams.append(team)
    
    db.commit()
    return teams

async def process_player_data(db: Session) -> List[models.Player]:
    """
    Process player data from the API and store in database
    
    Args:
        db: Database session
        
    Returns:
        List of player models
    """
    # Fetch batsmen data
    batsmen_data = await fetch_top_run_scorers()
    # Fetch bowlers data
    bowlers_data = await fetch_most_wickets()
    
    players = []
    
    # Process batsmen
    for player_info in batsmen_data.get("Batsmen", []):
        player = db.query(models.Player).filter(models.Player.player_code == player_info["PlayerID"]).first()
        
        if not player:
            # Create new player
            player = models.Player(
                player_code=player_info["PlayerID"],
                name=player_info["Name"],
                country=player_info.get("Country", ""),
                role="Batsman",  # Default role, will be updated if they're also a bowler
                image_url=player_info.get("PlayerImg", ""),
                matches=int(player_info.get("Matches", 0)),
                runs=int(player_info.get("Runs", 0)),
                balls_faced=int(player_info.get("BallsFaced", 0)),
                highest_score=int(player_info.get("HighestScore", 0)),
                fifties=int(player_info.get("50s", 0)),
                hundreds=int(player_info.get("100s", 0)),
                fours=int(player_info.get("4s", 0)),
                sixes=int(player_info.get("6s", 0)),
                batting_average=float(player_info.get("Average", 0.0)),
                strike_rate=float(player_info.get("StrikeRate", 0.0))
            )
            
            # Add player to team
            team_code = player_info.get("TeamCode")
            if team_code:
                team = db.query(models.Team).filter(models.Team.team_code == team_code).first()
                if team:
                    player.teams.append(team)
            
            db.add(player)
        else:
            # Update existing player batting stats
            player.matches = max(player.matches, int(player_info.get("Matches", 0)))
            player.runs = int(player_info.get("Runs", 0))
            player.balls_faced = int(player_info.get("BallsFaced", 0))
            player.highest_score = int(player_info.get("HighestScore", 0))
            player.fifties = int(player_info.get("50s", 0))
            player.hundreds = int(player_info.get("100s", 0))
            player.fours = int(player_info.get("4s", 0))
            player.sixes = int(player_info.get("6s", 0))
            player.batting_average = float(player_info.get("Average", 0.0))
            player.strike_rate = float(player_info.get("StrikeRate", 0.0))
        
        players.append(player)
    
    # Process bowlers
    for player_info in bowlers_data.get("Bowlers", []):
        player = db.query(models.Player).filter(models.Player.player_code == player_info["PlayerID"]).first()
        
        if not player:
            # Create new player
            player = models.Player(
                player_code=player_info["PlayerID"],
                name=player_info["Name"],
                country=player_info.get("Country", ""),
                role="Bowler",
                image_url=player_info.get("PlayerImg", ""),
                matches=int(player_info.get("Matches", 0)),
                wickets=int(player_info.get("Wickets", 0)),
                balls_bowled=int(player_info.get("Balls", 0)),
                runs_conceded=int(player_info.get("Runs", 0)),
                best_bowling_figures=player_info.get("BestFigures", ""),
                economy_rate=float(player_info.get("Economy", 0.0)),
                bowling_average=float(player_info.get("Average", 0.0)),
                bowling_strike_rate=float(player_info.get("StrikeRate", 0.0))
            )
            
            # Add player to team
            team_code = player_info.get("TeamCode")
            if team_code:
                team = db.query(models.Team).filter(models.Team.team_code == team_code).first()
                if team:
                    player.teams.append(team)
            
            db.add(player)
        else:
            # Update existing player bowling stats
            player.matches = max(player.matches, int(player_info.get("Matches", 0)))
            player.wickets = int(player_info.get("Wickets", 0))
            player.balls_bowled = int(player_info.get("Balls", 0))
            player.runs_conceded = int(player_info.get("Runs", 0))
            player.best_bowling_figures = player_info.get("BestFigures", "")
            player.economy_rate = float(player_info.get("Economy", 0.0))
            player.bowling_average = float(player_info.get("Average", 0.0))
            player.bowling_strike_rate = float(player_info.get("StrikeRate", 0.0))
            
            # If they were previously marked as just a batsman, update to all-rounder
            if player.role == "Batsman":
                player.role = "All-rounder"
        
        if player not in players:
            players.append(player)
    
    db.commit()
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
        match_code = match_info["MatchID"]
        
        # Check if match already exists
        match = db.query(models.Match).filter(models.Match.match_code == match_code).first()
        
        if not match:
            # Get team references
            home_team = db.query(models.Team).filter(models.Team.team_code == match_info["HomeTeamCode"]).first()
            away_team = db.query(models.Team).filter(models.Team.team_code == match_info["AwayTeamCode"]).first()
            
            if not home_team or not away_team:
                continue  # Skip if teams not found
            
            # Parse match date
            match_date = datetime.strptime(match_info["MatchDate"], "%Y-%m-%d %H:%M:%S")
            
            # Create new match
            match = models.Match(
                match_code=match_code,
                season=match_info.get("Season", "2025"),
                date=match_date,
                venue=match_info.get("Venue", ""),
                city=match_info.get("City", ""),
                home_team_id=home_team.id,
                away_team_id=away_team.id,
                match_status=match_info.get("MatchStatus", "Scheduled")
            )
            
            # Add match result if available
            if match_info.get("WinningTeamCode"):
                winner = db.query(models.Team).filter(models.Team.team_code == match_info["WinningTeamCode"]).first()
                if winner:
                    match.winner_id = winner.id
                    match.win_margin = int(match_info.get("WinMargin", 0))
                    match.win_type = match_info.get("WinType", "")
            
            # Add toss info if available
            if match_info.get("TossWinnerCode"):
                toss_winner = db.query(models.Team).filter(models.Team.team_code == match_info["TossWinnerCode"]).first()
                if toss_winner:
                    match.toss_winner_id = toss_winner.id
                    match.toss_decision = match_info.get("TossDecision", "")
            
            # Add innings info if available
            if match_info.get("FirstInningsScore"):
                match.first_innings_score = int(match_info["FirstInningsScore"])
                match.first_innings_wickets = int(match_info.get("FirstInningsWickets", 0))
                match.first_innings_overs = float(match_info.get("FirstInningsOvers", 0.0))
            
            if match_info.get("SecondInningsScore"):
                match.second_innings_score = int(match_info["SecondInningsScore"])
                match.second_innings_wickets = int(match_info.get("SecondInningsWickets", 0))
                match.second_innings_overs = float(match_info.get("SecondInningsOvers", 0.0))
            
            db.add(match)
            
            # Create innings records if match is completed
            if match.match_status == "Completed":
                # First innings
                first_innings = models.Innings(
                    match_id=match.id,
                    innings_number=1,
                    batting_team_id=home_team.id if match_info.get("FirstBattingTeamCode") == home_team.team_code else away_team.id,
                    bowling_team_id=away_team.id if match_info.get("FirstBattingTeamCode") == home_team.team_code else home_team.id,
                    total_runs=match.first_innings_score,
                    total_wickets=match.first_innings_wickets,
                    total_overs=match.first_innings_overs
                )
                db.add(first_innings)
                
                # Second innings
                second_innings = models.Innings(
                    match_id=match.id,
                    innings_number=2,
                    batting_team_id=away_team.id if match_info.get("FirstBattingTeamCode") == home_team.team_code else home_team.id,
                    bowling_team_id=home_team.id if match_info.get("FirstBattingTeamCode") == home_team.team_code else away_team.id,
                    total_runs=match.second_innings_score,
                    total_wickets=match.second_innings_wickets,
                    total_overs=match.second_innings_overs
                )
                db.add(second_innings)
        else:
            # Update existing match with latest info
            match.match_status = match_info.get("MatchStatus", match.match_status)
            
            # Update match result if available and not already set
            if match_info.get("WinningTeamCode") and not match.winner_id:
                winner = db.query(models.Team).filter(models.Team.team_code == match_info["WinningTeamCode"]).first()
                if winner:
                    match.winner_id = winner.id
                    match.win_margin = int(match_info.get("WinMargin", 0))
                    match.win_type = match_info.get("WinType", "")
            
            # Update innings info if available
            if match_info.get("FirstInningsScore"):
                match.first_innings_score = int(match_info["FirstInningsScore"])
                match.first_innings_wickets = int(match_info.get("FirstInningsWickets", 0))
                match.first_innings_overs = float(match_info.get("FirstInningsOvers", 0.0))
            
            if match_info.get("SecondInningsScore"):
                match.second_innings_score = int(match_info["SecondInningsScore"])
                match.second_innings_wickets = int(match_info.get("SecondInningsWickets", 0))
                match.second_innings_overs = float(match_info.get("SecondInningsOvers", 0.0))
        
        matches.append(match)
    
    db.commit()
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
        
        # Check if match already exists
        match_date = datetime.strptime(info.get("dates", [""])[0], "%Y-%m-%d")
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