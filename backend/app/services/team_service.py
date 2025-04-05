from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.db import models

def team_to_dict(team: models.Team, include_players: bool = False) -> Dict[str, Any]:
    """Convert team model to dictionary"""
    result = {
        "id": team.id,
        "team_code": team.team_code,
        "name": team.name,
        "short_name": team.short_name,
        "logo_url": team.logo_url,
        "primary_color": team.primary_color,
        "secondary_color": team.secondary_color,
        "matches_played": team.matches_played,
        "matches_won": team.matches_won,
        "matches_lost": team.matches_lost,
        "matches_tied": team.matches_tied,
        "net_run_rate": team.net_run_rate,
        "points": team.points
    }
    
    if include_players:
        result["players"] = [
            {
                "id": player.id,
                "name": player.name,
                "role": player.role,
                "image_url": player.image_url
            }
            for player in team.players
        ]
    
    return result

def match_to_dict(match: models.Match) -> Dict[str, Any]:
    """Convert match model to dictionary for team context"""
    return {
        "id": match.id,
        "match_code": match.match_code,
        "date": match.date.isoformat() if match.date else None,
        "venue": match.venue,
        "city": match.city,
        "home_team": {
            "id": match.home_team.id,
            "name": match.home_team.name,
            "short_name": match.home_team.short_name
        } if match.home_team else None,
        "away_team": {
            "id": match.away_team.id,
            "name": match.away_team.name,
            "short_name": match.away_team.short_name
        } if match.away_team else None,
        "match_status": match.match_status,
        "result": {
            "winner": match.winner_id,
            "win_margin": match.win_margin,
            "win_type": match.win_type
        } if match.winner_id else None
    }

def get_team_stats(team_id: int, db: Session) -> Dict[str, Any]:
    """Get detailed stats for a team"""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    
    # Get all matches for the team
    matches = db.query(models.Match).filter(
        (models.Match.home_team_id == team_id) | (models.Match.away_team_id == team_id),
        models.Match.match_status == "Completed"
    ).all()
    
    # Calculate stats
    total_matches = len(matches)
    wins = sum(1 for match in matches if match.winner_id == team_id)
    losses = sum(1 for match in matches if match.winner_id and match.winner_id != team_id)
    no_results = total_matches - wins - losses
    
    win_percentage = (wins / total_matches * 100) if total_matches > 0 else 0
    
    # Batting stats
    innings = db.query(models.Innings).filter(
        models.Innings.batting_team_id == team_id
    ).all()
    
    total_runs = sum(inn.total_runs for inn in innings)
    total_wickets = sum(inn.total_wickets for inn in innings)
    total_overs = sum(inn.total_overs for inn in innings)
    
    batting_avg = total_runs / total_wickets if total_wickets > 0 else float('inf')
    run_rate = total_runs / total_overs if total_overs > 0 else 0
    
    # Bowling stats
    bowling_innings = db.query(models.Innings).filter(
        models.Innings.bowling_team_id == team_id
    ).all()
    
    runs_conceded = sum(inn.total_runs for inn in bowling_innings)
    wickets_taken = sum(inn.total_wickets for inn in bowling_innings)
    overs_bowled = sum(inn.total_overs for inn in bowling_innings)
    
    bowling_avg = runs_conceded / wickets_taken if wickets_taken > 0 else float('inf')
    economy_rate = runs_conceded / overs_bowled if overs_bowled > 0 else 0
    
    # Venue stats
    venue_stats = {}
    for match in matches:
        venue = match.venue
        if venue not in venue_stats:
            venue_stats[venue] = {"matches": 0, "wins": 0}
        
        venue_stats[venue]["matches"] += 1
        if match.winner_id == team_id:
            venue_stats[venue]["wins"] += 1
    
    # Convert venue stats to list
    venue_stats_list = [
        {
            "venue": venue,
            "matches": stats["matches"],
            "wins": stats["wins"],
            "win_percentage": (stats["wins"] / stats["matches"] * 100) if stats["matches"] > 0 else 0
        }
        for venue, stats in venue_stats.items()
    ]
    
    # Toss stats
    toss_wins = sum(1 for match in matches if match.toss_winner_id == team_id)
    wins_after_winning_toss = sum(1 for match in matches 
                                if match.toss_winner_id == team_id and match.winner_id == team_id)
    
    toss_win_percentage = (toss_wins / total_matches * 100) if total_matches > 0 else 0
    win_after_toss_percentage = (wins_after_winning_toss / toss_wins * 100) if toss_wins > 0 else 0
    
    # Top performers
    top_batsmen = db.query(models.Player).join(
        models.player_team_association
    ).filter(
        models.player_team_association.c.team_id == team_id
    ).order_by(
        models.Player.runs.desc()
    ).limit(5).all()
    
    top_bowlers = db.query(models.Player).join(
        models.player_team_association
    ).filter(
        models.player_team_association.c.team_id == team_id
    ).order_by(
        models.Player.wickets.desc()
    ).limit(5).all()
    
    return {
        "team": team_to_dict(team),
        "overall": {
            "matches": total_matches,
            "wins": wins,
            "losses": losses,
            "no_results": no_results,
            "win_percentage": win_percentage,
            "points": team.points,
            "net_run_rate": team.net_run_rate
        },
        "batting": {
            "total_runs": total_runs,
            "batting_average": batting_avg,
            "run_rate": run_rate
        },
        "bowling": {
            "wickets_taken": wickets_taken,
            "bowling_average": bowling_avg,
            "economy_rate": economy_rate
        },
        "venues": venue_stats_list,
        "toss": {
            "toss_wins": toss_wins,
            "toss_win_percentage": toss_win_percentage,
            "wins_after_winning_toss": wins_after_winning_toss,
            "win_after_toss_percentage": win_after_toss_percentage
        },
        "top_performers": {
            "batsmen": [
                {
                    "id": player.id,
                    "name": player.name,
                    "runs": player.runs,
                    "average": player.batting_average,
                    "strike_rate": player.strike_rate
                }
                for player in top_batsmen
            ],
            "bowlers": [
                {
                    "id": player.id,
                    "name": player.name,
                    "wickets": player.wickets,
                    "average": player.bowling_average,
                    "economy_rate": player.economy_rate
                }
                for player in top_bowlers
            ]
        }
    }

def get_head_to_head_stats(team1_id: int, team2_id: int, db: Session) -> Dict[str, Any]:
    """Get head-to-head stats between two teams"""
    team1 = db.query(models.Team).filter(models.Team.id == team1_id).first()
    team2 = db.query(models.Team).filter(models.Team.id == team2_id).first()
    
    # Get all matches between the two teams
    matches = db.query(models.Match).filter(
        ((models.Match.home_team_id == team1_id) & (models.Match.away_team_id == team2_id)) |
        ((models.Match.home_team_id == team2_id) & (models.Match.away_team_id == team1_id)),
        models.Match.match_status == "Completed"
    ).all()
    
    # Calculate stats
    total_matches = len(matches)
    team1_wins = sum(1 for match in matches if match.winner_id == team1_id)
    team2_wins = sum(1 for match in matches if match.winner_id == team2_id)
    no_results = total_matches - team1_wins - team2_wins
    
    # Get highest and lowest scores
    team1_innings = db.query(models.Innings).filter(
        models.Innings.batting_team_id == team1_id,
        models.Innings.match_id.in_([match.id for match in matches])
    ).all()
    
    team2_innings = db.query(models.Innings).filter(
        models.Innings.batting_team_id == team2_id,
        models.Innings.match_id.in_([match.id for match in matches])
    ).all()
    
    team1_highest = max([inn.total_runs for inn in team1_innings]) if team1_innings else 0
    team1_lowest = min([inn.total_runs for inn in team1_innings]) if team1_innings else 0
    
    team2_highest = max([inn.total_runs for inn in team2_innings]) if team2_innings else 0
    team2_lowest = min([inn.total_runs for inn in team2_innings]) if team2_innings else 0
    
    # Get recent matches
    recent_matches = sorted(matches, key=lambda x: x.date, reverse=True)[:5]
    
    return {
        "team1": team_to_dict(team1),
        "team2": team_to_dict(team2),
        "head_to_head": {
            "total_matches": total_matches,
            "team1_wins": team1_wins,
            "team2_wins": team2_wins,
            "no_results": no_results
        },
        "batting_records": {
            "team1_highest": team1_highest,
            "team1_lowest": team1_lowest,
            "team2_highest": team2_highest,
            "team2_lowest": team2_lowest
        },
        "recent_matches": [match_to_dict(match) for match in recent_matches]
    }