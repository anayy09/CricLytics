from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import numpy as np
from sklearn.linear_model import LogisticRegression

from app.db import models

def match_to_dict(
    match: models.Match, 
    include_commentary: bool = False,
    include_performances: bool = False
) -> Dict[str, Any]:
    """Convert match model to dictionary"""
    result = {
        "id": match.id,
        "match_code": match.match_code,
        "season": match.season,
        "date": match.date.isoformat() if match.date else None,
        "venue": match.venue,
        "city": match.city,
        "home_team": {
            "id": match.home_team.id,
            "name": match.home_team.name,
            "short_name": match.home_team.short_name,
            "logo_url": match.home_team.logo_url
        } if match.home_team else None,
        "away_team": {
            "id": match.away_team.id,
            "name": match.away_team.name,
            "short_name": match.away_team.short_name,
            "logo_url": match.away_team.logo_url
        } if match.away_team else None,
        "toss": {
            "winner": match.toss_winner_id,
            "decision": match.toss_decision
        } if match.toss_winner_id else None,
        "match_status": match.match_status,
        "result": {
            "winner": match.winner_id,
            "win_margin": match.win_margin,
            "win_type": match.win_type
        } if match.winner_id else None,
        "scores": {
            "first_innings": {
                "score": match.first_innings_score,
                "wickets": match.first_innings_wickets,
                "overs": match.first_innings_overs
            } if match.first_innings_score is not None else None,
            "second_innings": {
                "score": match.second_innings_score,
                "wickets": match.second_innings_wickets,
                "overs": match.second_innings_overs
            } if match.second_innings_score is not None else None
        }
    }
    
    if include_commentary:
        # Add commentary
        commentary = []
        for comment in match.commentary:
            commentary.append(commentary_to_dict(comment))
        
        result["commentary"] = commentary
    
    if include_performances:
        # Add batting and bowling performances
        innings_data = []
        for innings in match.innings:
            batting_performances = []
            for perf in innings.batting_performances:
                player = perf.player
                batting_performances.append({
                    "player": {
                        "id": player.id,
                        "name": player.name
                    } if player else None,
                    "runs": perf.runs,
                    "balls_faced": perf.balls_faced,
                    "fours": perf.fours,
                    "sixes": perf.sixes,
                    "strike_rate": perf.strike_rate,
                    "dismissal_type": perf.dismissal_type,
                    "batting_position": perf.batting_position
                })
            
            bowling_performances = []
            for perf in innings.bowling_performances:
                player = perf.player
                bowling_performances.append({
                    "player": {
                        "id": player.id,
                        "name": player.name
                    } if player else None,
                    "overs": perf.overs,
                    "maidens": perf.maidens,
                    "runs": perf.runs,
                    "wickets": perf.wickets,
                    "economy_rate": perf.economy_rate,
                    "dot_balls": perf.dot_balls
                })
            
            innings_data.append({
                "innings_number": innings.innings_number,
                "batting_team": {
                    "id": innings.batting_team_id,
                    "name": next((team.name for team in [match.home_team, match.away_team] if team.id == innings.batting_team_id), "Unknown")
                },
                "bowling_team": {
                    "id": innings.bowling_team_id,
                    "name": next((team.name for team in [match.home_team, match.away_team] if team.id == innings.bowling_team_id), "Unknown")
                },
                "total_runs": innings.total_runs,
                "total_wickets": innings.total_wickets,
                "total_overs": innings.total_overs,
                "extras": innings.extras,
                "batting_performances": batting_performances,
                "bowling_performances": bowling_performances
            })
        
        result["innings"] = innings_data
    
    return result

def commentary_to_dict(commentary: models.Commentary) -> Dict[str, Any]:
    """Convert commentary model to dictionary"""
    return {
        "id": commentary.id,
        "innings_number": commentary.innings_number,
        "over_number": commentary.over_number,
        "ball_number": commentary.ball_number,
        "commentary_text": commentary.commentary_text,
        "runs_scored": commentary.runs_scored,
        "is_wicket": commentary.is_wicket,
        "is_boundary": commentary.is_boundary,
        "batsman_id": commentary.batsman_id,
        "bowler_id": commentary.bowler_id,
        "created_at": commentary.created_at.isoformat() if commentary.created_at else None
    }

def calculate_win_probability(match: models.Match, db: Session) -> Dict[str, Any]:
    """Calculate win probability for a live match"""
    if match.match_status != "Live":
        return {
            "home_team_probability": 0.5,
            "away_team_probability": 0.5,
            "message": "Match is not live"
        }
    
    # Get current match state
    current_innings = 1 if match.first_innings_score is not None and match.second_innings_score is None else 2
    
    if current_innings == 1:
        # First innings in progress
        batting_team_id = match.home_team_id if match.toss_winner_id == match.home_team_id and match.toss_decision == "Bat" else match.away_team_id
        bowling_team_id = match.away_team_id if batting_team_id == match.home_team_id else match.home_team_id
        
        current_score = match.first_innings_score or 0
        current_wickets = match.first_innings_wickets or 0
        current_overs = match.first_innings_overs or 0
        
        # Simple model: higher score and more overs remaining = higher win probability
        max_overs = 20
        remaining_overs = max_overs - current_overs
        wickets_remaining = 10 - current_wickets
        
        # Estimate final score based on current run rate and wickets in hand
        current_run_rate = current_score / current_overs if current_overs > 0 else 0
        estimated_final_score = current_score + (current_run_rate * remaining_overs)
        
        # Adjust for wickets in hand (more wickets = potentially higher scoring rate)
        wicket_factor = 1 + (wickets_remaining / 20)  # Max 50% boost for all 10 wickets
        estimated_final_score *= wicket_factor
        
        # Get average first innings score at this venue
        venue_matches = db.query(models.Match).filter(
            models.Match.venue == match.venue,
            models.Match.match_status == "Completed",
            models.Match.first_innings_score.isnot(None)
        ).all()
        
        avg_first_innings_score = sum(m.first_innings_score for m in venue_matches) / len(venue_matches) if venue_matches else 160
        
        # Compare estimated score to average
        score_ratio = estimated_final_score / avg_first_innings_score
        
        # Convert to win probability
        # Simple sigmoid function to map score ratio to probability
        batting_team_prob = 1 / (1 + np.exp(-5 * (score_ratio - 1)))
        
        # Adjust for team strength (using points in the table)
        batting_team = db.query(models.Team).filter(models.Team.id == batting_team_id).first()
        bowling_team = db.query(models.Team).filter(models.Team.id == bowling_team_id).first()
        
        if batting_team and bowling_team:
            team_strength_diff = (batting_team.points - bowling_team.points) / 20  # Normalize to [-1, 1]
            batting_team_prob = min(max(batting_team_prob + (team_strength_diff * 0.1), 0.1), 0.9)
        
        return {
            "home_team_probability": batting_team_prob if batting_team_id == match.home_team_id else 1 - batting_team_prob,
            "away_team_probability": batting_team_prob if batting_team_id == match.away_team_id else 1 - batting_team_prob,
            "message": "First innings in progress"
        }
    else:
        # Second innings in progress
        batting_team_id = match.away_team_id if match.toss_winner_id == match.home_team_id and match.toss_decision == "Bat" else match.home_team_id
        bowling_team_id = match.home_team_id if batting_team_id == match.away_team_id else match.away_team_id
        
        target = match.first_innings_score + 1
        current_score = match.second_innings_score or 0
        current_wickets = match.second_innings_wickets or 0
        current_overs = match.second_innings_overs or 0
        
        # Calculate required run rate
        max_overs = 20
        remaining_overs = max_overs - current_overs
        runs_needed = target - current_score
        required_run_rate = runs_needed / remaining_overs if remaining_overs > 0 else float('inf')
        
        # Get average second innings run rate at this venue
        venue_matches = db.query(models.Match).filter(
            models.Match.venue == match.venue,
            models.Match.match_status == "Completed",
            models.Match.second_innings_score.isnot(None),
            models.Match.second_innings_overs.isnot(None)
        ).all()
        
        avg_second_innings_run_rates = [
            m.second_innings_score / m.second_innings_overs 
            for m in venue_matches 
            if m.second_innings_overs > 0
        ]
        
        avg_run_rate = sum(avg_second_innings_run_rates) / len(avg_second_innings_run_rates) if avg_second_innings_run_rates else 8.0
        
        # Compare required run rate to average
        rate_ratio = required_run_rate / avg_run_rate
        
        # Convert to win probability for chasing team
        # Higher ratio = harder chase = lower probability
        chasing_team_prob = 1 / (1 + np.exp(2 * (rate_ratio - 1)))
        
        # Adjust for wickets in hand
        wicket_factor = current_wickets / 10
        chasing_team_prob *= (1 - wicket_factor * 0.5)  # Lose up to 50% probability with wickets lost
        
        # Adjust for team strength
        batting_team = db.query(models.Team).filter(models.Team.id == batting_team_id).first()
        bowling_team = db.query(models.Team).filter(models.Team.id == bowling_team_id).first()
        
        if batting_team and bowling_team:
            team_strength_diff = (batting_team.points - bowling_team.points) / 20  # Normalize to [-1, 1]
            chasing_team_prob = min(max(chasing_team_prob + (team_strength_diff * 0.1), 0.1), 0.9)
        
        return {
            "home_team_probability": chasing_team_prob if batting_team_id == match.home_team_id else 1 - chasing_team_prob,
            "away_team_probability": chasing_team_prob if batting_team_id == match.away_team_id else 1 - chasing_team_prob,
            "message": "Second innings in progress"
        }