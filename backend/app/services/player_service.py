from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.db import models

def player_to_dict(player: models.Player, include_performances: bool = False) -> Dict[str, Any]:
    """Convert player model to dictionary"""
    result = {
        "id": player.id,
        "player_code": player.player_code,
        "name": player.name,
        "country": player.country,
        "date_of_birth": player.date_of_birth.isoformat() if player.date_of_birth else None,
        "batting_style": player.batting_style,
        "bowling_style": player.bowling_style,
        "role": player.role,
        "image_url": player.image_url,
        "teams": [
            {
                "id": team.id,
                "name": team.name,
                "short_name": team.short_name
            }
            for team in player.teams
        ],
        "stats": {
            "matches": player.matches,
            "batting": {
                "runs": player.runs,
                "balls_faced": player.balls_faced,
                "highest_score": player.highest_score,
                "fifties": player.fifties,
                "hundreds": player.hundreds,
                "fours": player.fours,
                "sixes": player.sixes,
                "average": player.batting_average,
                "strike_rate": player.strike_rate
            },
            "bowling": {
                "wickets": player.wickets,
                "balls_bowled": player.balls_bowled,
                "runs_conceded": player.runs_conceded,
                "best_bowling_figures": player.best_bowling_figures,
                "economy_rate": player.economy_rate,
                "average": player.bowling_average,
                "strike_rate": player.bowling_strike_rate
            }
        }
    }
    
    if include_performances:
        # Add recent batting performances
        batting_performances = []
        for perf in player.batting_performances[:5]:  # Get 5 most recent
            innings = perf.innings
            if innings:
                match = innings.match
                if match:
                    batting_performances.append({
                        "match_id": match.id,
                        "date": match.date.isoformat() if match.date else None,
                        "against": innings.bowling_team_id,
                        "runs": perf.runs,
                        "balls_faced": perf.balls_faced,
                        "fours": perf.fours,
                        "sixes": perf.sixes,
                        "strike_rate": perf.strike_rate,
                        "dismissal_type": perf.dismissal_type
                    })
        
        # Add recent bowling performances
        bowling_performances = []
        for perf in player.bowling_performances[:5]:  # Get 5 most recent
            innings = perf.innings
            if innings:
                match = innings.match
                if match:
                    bowling_performances.append({
                        "match_id": match.id,
                        "date": match.date.isoformat() if match.date else None,
                        "against": innings.batting_team_id,
                        "overs": perf.overs,
                        "maidens": perf.maidens,
                        "runs": perf.runs,
                        "wickets": perf.wickets,
                        "economy_rate": perf.economy_rate,
                        "dot_balls": perf.dot_balls
                    })
        
        result["recent_performances"] = {
            "batting": batting_performances,
            "bowling": bowling_performances
        }
    
    return result

def match_to_dict(match: models.Match) -> Dict[str, Any]:
    """Convert match model to dictionary for player context"""
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

def get_player_stats(player_id: int, db: Session) -> Dict[str, Any]:
    """Get detailed stats for a player"""
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    
    # Get all batting performances
    batting_performances = db.query(models.BattingPerformance).filter(
        models.BattingPerformance.player_id == player_id
    ).all()
    
    # Get all bowling performances
    bowling_performances = db.query(models.BowlingPerformance).filter(
        models.BowlingPerformance.player_id == player_id
    ).all()
    
    # Calculate batting stats by venue
    venue_batting_stats = {}
    for perf in batting_performances:
        innings = perf.innings
        if not innings:
            continue
            
        match = db.query(models.Match).filter(models.Match.id == innings.match_id).first()
        if not match:
            continue
            
        venue = match.venue
        if venue not in venue_batting_stats:
            venue_batting_stats[venue] = {
                "innings": 0,
                "runs": 0,
                "balls_faced": 0,
                "fours": 0,
                "sixes": 0
            }
        
        venue_batting_stats[venue]["innings"] += 1
        venue_batting_stats[venue]["runs"] += perf.runs
        venue_batting_stats[venue]["balls_faced"] += perf.balls_faced
        venue_batting_stats[venue]["fours"] += perf.fours
        venue_batting_stats[venue]["sixes"] += perf.sixes
    
    # Calculate bowling stats by venue
    venue_bowling_stats = {}
    for perf in bowling_performances:
        innings = perf.innings
        if not innings:
            continue
            
        match = db.query(models.Match).filter(models.Match.id == innings.match_id).first()
        if not match:
            continue
            
        venue = match.venue
        if venue not in venue_bowling_stats:
            venue_bowling_stats[venue] = {
                "innings": 0,
                "overs": 0,
                "maidens": 0,
                "runs": 0,
                "wickets": 0,
                "dot_balls": 0
            }
        
        venue_bowling_stats[venue]["innings"] += 1
        venue_bowling_stats[venue]["overs"] += perf.overs
        venue_bowling_stats[venue]["maidens"] += perf.maidens
        venue_bowling_stats[venue]["runs"] += perf.runs
        venue_bowling_stats[venue]["wickets"] += perf.wickets
        venue_bowling_stats[venue]["dot_balls"] += perf.dot_balls
    
    # Calculate stats against each team
    team_stats = {}
    
    # Batting stats by team
    for perf in batting_performances:
        innings = perf.innings
        if not innings:
            continue
            
        team_id = innings.bowling_team_id
        if team_id not in team_stats:
            team_stats[team_id] = {
                "batting": {
                    "innings": 0,
                    "runs": 0,
                    "balls_faced": 0,
                    "average": 0,
                    "strike_rate": 0
                },
                "bowling": {
                    "innings": 0,
                    "overs": 0,
                    "runs": 0,
                    "wickets": 0,
                    "economy": 0,
                    "average": 0
                }
            }
        
        team_stats[team_id]["batting"]["innings"] += 1
        team_stats[team_id]["batting"]["runs"] += perf.runs
        team_stats[team_id]["batting"]["balls_faced"] += perf.balls_faced
    
    # Bowling stats by team
    for perf in bowling_performances:
        innings = perf.innings
        if not innings:
            continue
            
        team_id = innings.batting_team_id
        if team_id not in team_stats:
            team_stats[team_id] = {
                "batting": {
                    "innings": 0,
                    "runs": 0,
                    "balls_faced": 0,
                    "average": 0,
                    "strike_rate": 0
                },
                "bowling": {
                    "innings": 0,
                    "overs": 0,
                    "runs": 0,
                    "wickets": 0,
                    "economy": 0,
                    "average": 0
                }
            }
        
        team_stats[team_id]["bowling"]["innings"] += 1
        team_stats[team_id]["bowling"]["overs"] += perf.overs
        team_stats[team_id]["bowling"]["runs"] += perf.runs
        team_stats[team_id]["bowling"]["wickets"] += perf.wickets
    
    # Calculate averages and strike rates
    for team_id, stats in team_stats.items():
        # Batting
        if stats["batting"]["innings"] > 0:
            stats["batting"]["average"] = stats["batting"]["runs"] / stats["batting"]["innings"]
            stats["batting"]["strike_rate"] = (stats["batting"]["runs"] / stats["batting"]["balls_faced"] * 100) if stats["batting"]["balls_faced"] > 0 else 0
        
        # Bowling
        if stats["bowling"]["wickets"] > 0:
            stats["bowling"]["average"] = stats["bowling"]["runs"] / stats["bowling"]["wickets"]
        else:
            stats["bowling"]["average"] = float('inf')
            
        if stats["bowling"]["overs"] > 0:
            stats["bowling"]["economy"] = stats["bowling"]["runs"] / stats["bowling"]["overs"]
        else:
            stats["bowling"]["economy"] = 0
    
    # Get team names for the stats
    team_details = {}
    for team_id in team_stats.keys():
        team = db.query(models.Team).filter(models.Team.id == team_id).first()
        if team:
            team_details[team_id] = {
                "id": team.id,
                "name": team.name,
                "short_name": team.short_name
            }
    
    # Format the team stats for response
    formatted_team_stats = [
        {
            "team": team_details.get(team_id, {"id": team_id, "name": "Unknown", "short_name": "UNK"}),
            "batting": stats["batting"],
            "bowling": stats["bowling"]
        }
        for team_id, stats in team_stats.items()
    ]
    
    # Calculate career progression
    # This would require match dates, which we'd need to join with the match table
    # For simplicity, we'll just return the current stats
    
    return {
        "player": player_to_dict(player),
        "venue_stats": {
            "batting": [
                {
                    "venue": venue,
                    "innings": stats["innings"],
                    "runs": stats["runs"],
                    "average": stats["runs"] / stats["innings"] if stats["innings"] > 0 else 0,
                    "strike_rate": (stats["runs"] / stats["balls_faced"] * 100) if stats["balls_faced"] > 0 else 0,
                    "fours": stats["fours"],
                    "sixes": stats["sixes"]
                }
                for venue, stats in venue_batting_stats.items()
            ],
            "bowling": [
                {
                    "venue": venue,
                    "innings": stats["innings"],
                    "overs": stats["overs"],
                    "maidens": stats["maidens"],
                    "runs": stats["runs"],
                    "wickets": stats["wickets"],
                    "economy": stats["runs"] / stats["overs"] if stats["overs"] > 0 else 0,
                    "average": stats["runs"] / stats["wickets"] if stats["wickets"] > 0 else float('inf'),
                    "dot_balls": stats["dot_balls"]
                }
                for venue, stats in venue_bowling_stats.items()
            ]
        },
        "team_stats": formatted_team_stats,
        "career_progression": {
            "matches": player.matches,
            "runs": player.runs,
            "wickets": player.wickets,
            "batting_average": player.batting_average,
            "bowling_average": player.bowling_average
        }
    }