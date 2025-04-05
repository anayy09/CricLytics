from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
import pandas as pd
from datetime import datetime

from app.db import models

async def predict_match_outcome(match: models.Match, db: Session) -> Dict[str, Any]:
    """
    Predict outcome for an upcoming match
    
    Args:
        match: Match model
        db: Database session
        
    Returns:
        Dictionary with prediction results
    """
    # Get team data
    home_team = db.query(models.Team).filter(models.Team.id == match.home_team_id).first()
    away_team = db.query(models.Team).filter(models.Team.id == match.away_team_id).first()
    
    if not home_team or not away_team:
        return {
            "error": "Team data not found"
        }
    
    # Get historical matches between these teams
    historical_matches = db.query(models.Match).filter(
        ((models.Match.home_team_id == match.home_team_id) & (models.Match.away_team_id == match.away_team_id)) |
        ((models.Match.home_team_id == match.away_team_id) & (models.Match.away_team_id == match.home_team_id)),
        models.Match.match_status == "Completed"
    ).all()
    
    # Calculate head-to-head stats
    home_wins = sum(1 for m in historical_matches if m.winner_id == match.home_team_id)
    away_wins = sum(1 for m in historical_matches if m.winner_id == match.away_team_id)
    
    # Get recent form (last 5 matches)
    home_recent_matches = db.query(models.Match).filter(
        (models.Match.home_team_id == match.home_team_id) | (models.Match.away_team_id == match.home_team_id),
        models.Match.match_status == "Completed"
    ).order_by(models.Match.date.desc()).limit(5).all()
    
    away_recent_matches = db.query(models.Match).filter(
        (models.Match.home_team_id == match.away_team_id) | (models.Match.away_team_id == match.away_team_id),
        models.Match.match_status == "Completed"
    ).order_by(models.Match.date.desc()).limit(5).all()
    
    home_recent_wins = sum(1 for m in home_recent_matches if m.winner_id == match.home_team_id)
    away_recent_wins = sum(1 for m in away_recent_matches if m.winner_id == match.away_team_id)
    
    # Get venue stats
    venue_matches = db.query(models.Match).filter(
        models.Match.venue == match.venue,
        models.Match.match_status == "Completed"
    ).all()
    
    home_venue_matches = [m for m in venue_matches if m.home_team_id == match.home_team_id]
    home_venue_wins = sum(1 for m in home_venue_matches if m.winner_id == match.home_team_id)
    
    away_venue_matches = [m for m in venue_matches if m.home_team_id == match.away_team_id]
    away_venue_wins = sum(1 for m in away_venue_matches if m.winner_id == match.away_team_id)
    
    # Get toss stats
    toss_win_match_win = sum(1 for m in venue_matches if m.toss_winner_id == m.winner_id)
    toss_win_match_win_pct = toss_win_match_win / len(venue_matches) if venue_matches else 0.5
    
    # Calculate win probabilities
    # This is a simplified model - in a real application, you'd use more features and proper ML
    
    # Base probability from team standings
    home_points = home_team.points
    away_points = away_team.points
    total_points = home_points + away_points
    
    home_base_prob = home_points / total_points if total_points > 0 else 0.5
    away_base_prob = away_points / total_points if total_points > 0 else 0.5
    
    # Adjust for head-to-head
    total_h2h = home_wins + away_wins
    h2h_factor = 0.2  # Weight for head-to-head
    
    if total_h2h > 0:
        home_prob = (1 - h2h_factor) * home_base_prob + h2h_factor * (home_wins / total_h2h)
        away_prob = (1 - h2h_factor) * away_base_prob + h2h_factor * (away_wins / total_h2h)
    else:
        home_prob = home_base_prob
        away_prob = away_base_prob
    
    # Adjust for recent form
    form_factor = 0.3  # Weight for recent form
    
    home_form = home_recent_wins / len(home_recent_matches) if home_recent_matches else 0.5
    away_form = away_recent_wins / len(away_recent_matches) if away_recent_matches else 0.5
    
    home_prob = (1 - form_factor) * home_prob + form_factor * home_form
    away_prob = (1 - form_factor) * away_prob + form_factor * away_form
    
    # Adjust for venue advantage
    venue_factor = 0.15  # Weight for venue advantage
    
    home_venue_win_rate = home_venue_wins / len(home_venue_matches) if home_venue_matches else 0.5
    away_venue_win_rate = away_venue_wins / len(away_venue_matches) if away_venue_matches else 0.5
    
    home_prob = (1 - venue_factor) * home_prob + venue_factor * home_venue_win_rate
    away_prob = (1 - venue_factor) * away_prob + venue_factor * away_venue_win_rate
    
    # Normalize probabilities
    total_prob = home_prob + away_prob
    home_prob = home_prob / total_prob
    away_prob = away_prob / total_prob
    
    # Get key players
    home_key_batsman = db.query(models.Player).join(
        models.player_team_association
    ).filter(
        models.player_team_association.c.team_id == match.home_team_id
    ).order_by(models.Player.runs.desc()).first()
    
    home_key_bowler = db.query(models.Player).join(
        models.player_team_association
    ).filter(
        models.player_team_association.c.team_id == match.home_team_id
    ).order_by(models.Player.wickets.desc()).first()
    
    away_key_batsman = db.query(models.Player).join(
        models.player_team_association
    ).filter(
        models.player_team_association.c.team_id == match.away_team_id
    ).order_by(models.Player.runs.desc()).first()
    
    away_key_bowler = db.query(models.Player).join(
        models.player_team_association
    ).filter(
        models.player_team_association.c.team_id == match.away_team_id
    ).order_by(models.Player.wickets.desc()).first()
    
    return {
        "match": {
            "id": match.id,
            "date": match.date.isoformat() if match.date else None,
            "venue": match.venue,
            "city": match.city
        },
        "teams": {
            "home": {
                "id": home_team.id,
                "name": home_team.name,
                "short_name": home_team.short_name,
                "win_probability": home_prob
            },
            "away": {
                "id": away_team.id,
                "name": away_team.name,
                "short_name": away_team.short_name,
                "win_probability": away_prob
            }
        },
        "factors": {
            "head_to_head": {
                "total_matches": len(historical_matches),
                "home_wins": home_wins,
                "away_wins": away_wins
            },
            "recent_form": {
                "home": {
                    "matches": len(home_recent_matches),
                    "wins": home_recent_wins
                },
                "away": {
                    "matches": len(away_recent_matches),
                    "wins": away_recent_wins
                }
            },
            "venue_advantage": {
                "home": {
                    "matches": len(home_venue_matches),
                    "wins": home_venue_wins
                },
                "away": {
                    "matches": len(away_venue_matches),
                    "wins": away_venue_wins
                },
                "toss_win_match_win_percentage": toss_win_match_win_pct
            }
        },
        "key_players": {
            "home": {
                "bat ": {
                    "id": home_key_batsman.id,
                    "name": home_key_batsman.name,
                    "runs": home_key_batsman.runs,
                    "average": home_key_batsman.batting_average,
                    "strike_rate": home_key_batsman.strike_rate
                } if home_key_batsman else None,
                "bowl": {
                    "id": home_key_bowler.id,
                    "name": home_key_bowler.name,
                    "wickets": home_key_bowler.wickets,
                    "economy": home_key_bowler.economy_rate,
                    "average": home_key_bowler.bowling_average
                } if home_key_bowler else None
            },
            "away": {
                "bat": {
                    "id": away_key_batsman.id,
                    "name": away_key_batsman.name,
                    "runs": away_key_batsman.runs,
                    "average": away_key_batsman.batting_average,
                    "strike_rate": away_key_batsman.strike_rate
                } if away_key_batsman else None,
                "bowl": {
                    "id": away_key_bowler.id,
                    "name": away_key_bowler.name,
                    "wickets": away_key_bowler.wickets,
                    "economy": away_key_bowler.economy_rate,
                    "average": away_key_bowler.bowling_average
                } if away_key_bowler else None
            }
        }
    }

async def predict_playoff_chances(db: Session) -> Dict[str, Any]:
    """
    Predict playoff chances for all teams
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with prediction results
    """
    # Get all teams
    teams = db.query(models.Team).all()
    
    # Get remaining matches
    remaining_matches = db.query(models.Match).filter(
        models.Match.match_status == "Scheduled"
    ).all()
    
    # Get completed matches
    completed_matches = db.query(models.Match).filter(
        models.Match.match_status == "Completed"
    ).all()
    
    # Calculate current standings
    standings = {}
    for team in teams:
        standings[team.id] = {
            "team": {
                "id": team.id,
                "name": team.name,
                "short_name": team.short_name
            },
            "points": team.points,
            "matches_played": team.matches_played,
            "matches_won": team.matches_won,
            "net_run_rate": team.net_run_rate,
            "remaining_matches": sum(1 for m in remaining_matches if m.home_team_id == team.id or m.away_team_id == team.id),
            "max_possible_points": team.points + (sum(1 for m in remaining_matches if m.home_team_id == team.id or m.away_team_id == team.id) * 2)
        }
    
    # Sort by current points and NRR
    sorted_standings = sorted(
        standings.values(),
        key=lambda x: (x["points"], x["net_run_rate"]),
        reverse=True
    )
    
    # Calculate playoff cutoff (typically 4 teams make playoffs)
    current_playoff_cutoff = sorted_standings[3]["points"] if len(sorted_standings) > 3 else 0
    
    # Calculate playoff scenarios
    playoff_chances = {}
    for team_id, team_standing in standings.items():
        # Teams that have already qualified
        if team_standing["points"] > current_playoff_cutoff + (team_standing["remaining_matches"] * 2):
            playoff_chances[team_id] = 1.0
            continue
            
        # Teams that are already eliminated
        if team_standing["max_possible_points"] < current_playoff_cutoff:
            playoff_chances[team_id] = 0.0
            continue
        
        # For teams in contention, use a simple model based on current points and remaining matches
        # In a real application, you'd simulate remaining matches with proper win probabilities
        points_needed = current_playoff_cutoff + 2 - team_standing["points"]  # Add 2 to be safe
        wins_needed = (points_needed + 1) // 2  # Ceiling division
        
        if wins_needed > team_standing["remaining_matches"]:
            playoff_chances[team_id] = 0.0
        else:
            # Simple probability model: chance of winning exactly wins_needed out of remaining_matches
            # This is a binomial probability with p=0.5 (assuming equal chance of winning each match)
            remaining = team_standing["remaining_matches"]
            needed = wins_needed
            
            # Use team's win rate as probability instead of 0.5
            win_rate = team_standing["matches_won"] / team_standing["matches_played"] if team_standing["matches_played"] > 0 else 0.5
            
            # Calculate probability of winning at least wins_needed matches
            prob = 0
            for i in range(needed, remaining + 1):
                # Binomial probability: nCr * p^r * (1-p)^(n-r)
                n_choose_r = np.math.factorial(remaining) / (np.math.factorial(i) * np.math.factorial(remaining - i))
                prob += n_choose_r * (win_rate ** i) * ((1 - win_rate) ** (remaining - i))
            
            playoff_chances[team_id] = prob
    
    # Format results
    results = []
    for team in teams:
        results.append({
            "team": {
                "id": team.id,
                "name": team.name,
                "short_name": team.short_name
            },
            "current_points": team.points,
            "max_possible_points": standings[team.id]["max_possible_points"],
            "remaining_matches": standings[team.id]["remaining_matches"],
            "playoff_chance": playoff_chances.get(team.id, 0.0),
            "status": "Qualified" if playoff_chances.get(team.id, 0.0) >= 0.99 else
                     "Eliminated" if playoff_chances.get(team.id, 0.0) <= 0.01 else
                     "In Contention"
        })
    
    # Sort by playoff chance
    results.sort(key=lambda x: x["playoff_chance"], reverse=True)
    
    return {
        "playoff_cutoff": current_playoff_cutoff,
        "teams": results
    }

async def simulate_season(simulations: int, db: Session) -> Dict[str, Any]:
    """
    Simulate the remainder of the season
    
    Args:
        simulations: Number of simulations to run
        db: Database session
        
    Returns:
        Dictionary with simulation results
    """
    # Get all teams
    teams = db.query(models.Team).all()
    team_dict = {team.id: team for team in teams}
    
    # Get remaining matches
    remaining_matches = db.query(models.Match).filter(
        models.Match.match_status == "Scheduled"
    ).all()
    
    # Initialize counters for playoff appearances and championships
    playoff_appearances = {team.id: 0 for team in teams}
    championships = {team.id: 0 for team in teams}
    
    # Run simulations
    for _ in range(simulations):
        # Copy current standings
        sim_standings = {}
        for team in teams:
            sim_standings[team.id] = {
                "points": team.points,
                "net_run_rate": team.net_run_rate
            }
        
        # Simulate remaining matches
        for match in remaining_matches:
            home_team = team_dict.get(match.home_team_id)
            away_team = team_dict.get(match.away_team_id)
            
            if not home_team or not away_team:
                continue
                
            # Simple win probability model based on current points and NRR
            home_strength = sim_standings[home_team.id]["points"] + sim_standings[home_team.id]["net_run_rate"]
            away_strength = sim_standings[away_team.id]["points"] + sim_standings[away_team.id]["net_run_rate"]
            
            total_strength = home_strength + away_strength
            home_win_prob = home_strength / total_strength if total_strength > 0 else 0.5
            
            # Add home advantage
            home_win_prob = min(max(home_win_prob + 0.1, 0.2), 0.8)
            
            # Simulate match outcome
            if np.random.random() < home_win_prob:
                # Home team wins
                sim_standings[home_team.id]["points"] += 2
                # Adjust NRR slightly
                sim_standings[home_team.id]["net_run_rate"] += np.random.uniform(0.05, 0.2)
                sim_standings[away_team.id]["net_run_rate"] -= np.random.uniform(0.05, 0.2)
            else:
                # Away team wins
                sim_standings[away_team.id]["points"] += 2
                # Adjust NRR slightly
                sim_standings[away_team.id]["net_run_rate"] += np.random.uniform(0.05, 0.2)
                sim_standings[home_team.id]["net_run_rate"] -= np.random.uniform(0.05, 0.2)
        
        # Determine playoff teams (top 4)
        playoff_teams = sorted(
            sim_standings.items(),
            key=lambda x: (x[1]["points"], x[1]["net_run_rate"]),
            reverse=True
        )[:4]
        
        for team_id, _ in playoff_teams:
            playoff_appearances[team_id] += 1
        
        # Simulate playoffs (simplified)
        # Qualifier 1: 1st vs 2nd
        # Eliminator: 3rd vs 4th
        # Qualifier 2: Loser of Q1 vs Winner of Eliminator
        # Final: Winner of Q1 vs Winner of Q2
        
        team1_id = playoff_teams[0][0]
        team2_id = playoff_teams[1][0]
        team3_id = playoff_teams[2][0]
        team4_id = playoff_teams[3][0]
        
        # Qualifier 1
        q1_winner = simulate_match(team1_id, team2_id, sim_standings)
        q1_loser = team1_id if q1_winner == team2_id else team2_id
        
        # Eliminator
        eliminator_winner = simulate_match(team3_id, team4_id, sim_standings)
        
        # Qualifier 2
        q2_winner = simulate_match(q1_loser, eliminator_winner, sim_standings)
        
        # Final
        champion = simulate_match(q1_winner, q2_winner, sim_standings)
        championships[champion] += 1
    
    # Calculate percentages
    playoff_percentages = {team_id: count / simulations * 100 for team_id, count in playoff_appearances.items()}
    championship_percentages = {team_id: count / simulations * 100 for team_id, count in championships.items()}
    
    # Format results
    results = []
    for team in teams:
        results.append({
            "team": {
                "id": team.id,
                "name": team.name,
                "short_name": team.short_name
            },
            "playoff_percentage": playoff_percentages.get(team.id, 0.0),
            "championship_percentage": championship_percentages.get(team.id, 0.0)
        })
    
    # Sort by championship percentage
    results.sort(key=lambda x: x["championship_percentage"], reverse=True)
    
    return {
        "simulations": simulations,
        "teams": results
    }

def simulate_match(team1_id: int, team2_id: int, standings: Dict[int, Dict[str, float]]) -> int:
    """
    Simulate a match between two teams
    
    Args:
        team1_id: ID of first team
        team2_id: ID of second team
        standings: Current standings with points and NRR
        
    Returns:
        ID of winning team
    """
    team1_strength = standings[team1_id]["points"] + standings[team1_id]["net_run_rate"]
    team2_strength = standings[team2_id]["points"] + standings[team2_id]["net_run_rate"]
    
    total_strength = team1_strength + team2_strength
    team1_win_prob = team1_strength / total_strength if total_strength > 0 else 0.5
    
    if np.random.random() < team1_win_prob:
        return team1_id
    else:
        return team2_id

async def predict_player_performance(
    player: models.Player, 
    match: Optional[models.Match] = None,
    db: Session = None
) -> Dict[str, Any]:
    """
    Predict performance for a player
    
    Args:
        player: Player model
        match: Optional match model for context-specific prediction
        db: Database session
        
    Returns:
        Dictionary with prediction results
    """
    # Get player's recent performances
    batting_performances = db.query(models.BattingPerformance).filter(
        models.BattingPerformance.player_id == player.id
    ).order_by(models.BattingPerformance.id.desc()).limit(10).all()
    
    bowling_performances = db.query(models.BowlingPerformance).filter(
        models.BowlingPerformance.player_id == player.id
    ).order_by(models.BowlingPerformance.id.desc()).limit(10).all()
    
    # Calculate average recent performance
    recent_runs = [perf.runs for perf in batting_performances]
    recent_balls_faced = [perf.balls_faced for perf in batting_performances]
    recent_wickets = [perf.wickets for perf in bowling_performances]
    recent_economy = [perf.economy_rate for perf in bowling_performances]
    
    avg_runs = sum(recent_runs) / len(recent_runs) if recent_runs else player.batting_average
    avg_balls_faced = sum(recent_balls_faced) / len(recent_balls_faced) if recent_balls_faced else 20
    avg_wickets = sum(recent_wickets) / len(recent_wickets) if recent_wickets else player.wickets / player.matches if player.matches > 0 else 1
    avg_economy = sum(recent_economy) / len(recent_economy) if recent_economy else player.economy_rate
    
    # Base prediction on recent averages
    predicted_runs = avg_runs
    predicted_balls_faced = avg_balls_faced
    predicted_strike_rate = (predicted_runs / predicted_balls_faced * 100) if predicted_balls_faced > 0 else player.strike_rate
    predicted_wickets = avg_wickets
    predicted_economy = avg_economy
    
    # Adjust for match context if provided
    if match:
        # Get venue stats
        venue_batting_perfs = []
        venue_bowling_perfs = []
        
        for perf in batting_performances:
            innings = perf.innings
            if innings and innings.match.venue == match.venue:
                venue_batting_perfs.append(perf)
        
        for perf in bowling_performances:
            innings = perf.innings
            if innings and innings.match.venue == match.venue:
                venue_bowling_perfs.append(perf)
        
        # Adjust for venue if we have data
        if venue_batting_perfs:
            venue_avg_runs = sum(perf.runs for perf in venue_batting_perfs) / len(venue_batting_perfs)
            venue_factor = venue_avg_runs / avg_runs if avg_runs > 0 else 1
            predicted_runs *= venue_factor
        
        if venue_bowling_perfs:
            venue_avg_wickets = sum(perf.wickets for perf in venue_bowling_perfs) / len(venue_bowling_perfs)
            venue_factor = venue_avg_wickets / avg_wickets if avg_wickets > 0 else 1
            predicted_wickets *= venue_factor
        
        # Adjust for opposition
        opposition_team_id = match.away_team_id if player.teams and player.teams[0].id == match.home_team_id else match.home_team_id
        
        opposition_batting_perfs = []
        opposition_bowling_perfs = []
        
        for perf in batting_performances:
            innings = perf.innings
            if innings and innings.bowling_team_id == opposition_team_id:
                opposition_batting_perfs.append(perf)
        
        for perf in bowling_performances:
            innings = perf.innings
            if innings and innings.batting_team_id == opposition_team_id:
                opposition_bowling_perfs.append(perf)
        
        # Adjust for opposition if we have data
        if opposition_batting_perfs:
            opp_avg_runs = sum(perf.runs for perf in opposition_batting_perfs) / len(opposition_batting_perfs)
            opp_factor = opp_avg_runs / avg_runs if avg_runs > 0 else 1
            predicted_runs *= opp_factor
        
        if opposition_bowling_perfs:
            opp_avg_wickets = sum(perf.wickets for perf in opposition_bowling_perfs) / len(opposition_bowling_perfs)
            opp_factor = opp_avg_wickets / avg_wickets if avg_wickets > 0 else 1
            predicted_wickets *= opp_factor
    
    # Add some randomness to predictions
    predicted_runs = max(0, np.random.normal(predicted_runs, predicted_runs * 0.3))
    predicted_wickets = max(0, np.random.normal(predicted_wickets, 1))
    
    # Round to reasonable values
    predicted_runs = round(predicted_runs)
    predicted_balls_faced = round(predicted_balls_faced)
    predicted_strike_rate = round(predicted_strike_rate, 1)
    predicted_wickets = round(predicted_wickets, 1)
    predicted_economy = round(predicted_economy, 1)
    
    return {
        "player": {
            "id": player.id,
            "name": player.name,
            "role": player.role
        },
        "match": {
            "id": match.id,
            "venue": match.venue,
            "date": match.date.isoformat() if match.date else None,
            "opposition": match.away_team.name if player.teams and player.teams[0].id == match.home_team_id else match.home_team.name
        } if match else None,
        "prediction": {
            "batting": {
                "runs": predicted_runs,
                "balls_faced": predicted_balls_faced,
                "strike_rate": predicted_strike_rate,
                "boundary_percentage": round(player.fours + player.sixes) / player.balls_faced * 100 if player.balls_faced > 0 else 10
            },
            "bowling": {
                "wickets": predicted_wickets,
                "economy_rate": predicted_economy,
                "dot_ball_percentage": 100 - (predicted_economy * 100 / 6)  # Rough estimate
            }
        },
        "confidence": {
            "batting": min(len(recent_runs) / 10, 1) * 100,
            "bowling": min(len(recent_wickets) / 10, 1) * 100
        }
    }