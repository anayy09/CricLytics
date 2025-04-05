import React from 'react';
import { Link } from 'react-router-dom';
import { MatchPrediction } from '../../types';
import Card from '../common/Card';
import './MatchPredictionCard.scss';

interface MatchPredictionCardProps {
  prediction: MatchPrediction;
}

const MatchPredictionCard: React.FC<MatchPredictionCardProps> = ({ prediction }) => {
  return (
    <Card title="Match Prediction" className="match-prediction-card">
      <div className="match-prediction-card__match-info">
        <div className="match-prediction-card__venue">
          <i className="fas fa-map-marker-alt"></i> {prediction.match.venue}, {prediction.match.city}
        </div>
        <div className="match-prediction-card__date">
          {prediction.match.date ? new Date(prediction.match.date).toLocaleDateString() : 'Date TBD'}
        </div>
      </div>
      
      <div className="match-prediction-card__teams">
        <div className="match-prediction-card__team">
          <div className="match-prediction-card__team-name">
            {prediction.teams.home.name}
          </div>
          <div className="match-prediction-card__team-probability">
            <div className="match-prediction-card__probability-value">
              {Math.round(prediction.teams.home.win_probability * 100)}%
            </div>
            <div className="match-prediction-card__probability-label">
              Win Probability
            </div>
          </div>
        </div>
        
        <div className="match-prediction-card__vs">VS</div>
        
        <div className="match-prediction-card__team">
          <div className="match-prediction-card__team-name">
            {prediction.teams.away.name}
          </div>
          <div className="match-prediction-card__team-probability">
            <div className="match-prediction-card__probability-value">
              {Math.round(prediction.teams.away.win_probability * 100)}%
            </div>
            <div className="match-prediction-card__probability-label">
              Win Probability
            </div>
          </div>
        </div>
      </div>
      
      <div className="match-prediction-card__probability-bar">
        <div 
          className="match-prediction-card__probability-fill match-prediction-card__probability-fill--home" 
          style={{ width: `${prediction.teams.home.win_probability * 100}%` }}
        ></div>
        <div 
          className="match-prediction-card__probability-fill match-prediction-card__probability-fill--away" 
          style={{ width: ` ${prediction.teams.away.win_probability * 100}%` }}
        ></div>
      </div>
      
      <div className="match-prediction-card__factors">
        <h4 className="match-prediction-card__factors-title">Key Factors</h4>
        
        <div className="match-prediction-card__factor">
          <div className="match-prediction-card__factor-label">Head to Head</div>
          <div className="match-prediction-card__factor-value">
            {prediction.factors.head_to_head.home_wins} - {prediction.factors.head_to_head.away_wins}
            <span className="match-prediction-card__factor-detail">
              (Total: {prediction.factors.head_to_head.total_matches})
            </span>
          </div>
        </div>
        
        <div className="match-prediction-card__factor">
          <div className="match-prediction-card__factor-label">Recent Form (Last 5)</div>
          <div className="match-prediction-card__factor-value">
            {prediction.factors.recent_form.home.wins}/{prediction.factors.recent_form.home.matches} vs {prediction.factors.recent_form.away.wins}/{prediction.factors.recent_form.away.matches}
          </div>
        </div>
        
        <div className="match-prediction-card__factor">
          <div className="match-prediction-card__factor-label">Venue Record</div>
          <div className="match-prediction-card__factor-value">
            {prediction.factors.venue_advantage.home.wins}/{prediction.factors.venue_advantage.home.matches} vs {prediction.factors.venue_advantage.away.wins}/{prediction.factors.venue_advantage.away.matches}
          </div>
        </div>
      </div>
      
      <div className="match-prediction-card__key-players">
        <h4 className="match-prediction-card__key-players-title">Key Players to Watch</h4>
        
        <div className="match-prediction-card__key-players-container">
          <div className="match-prediction-card__key-player">
            <div className="match-prediction-card__key-player-team">{prediction.teams.home.name}</div>
            {prediction.key_players.home.bat && (
              <div className="match-prediction-card__key-player-item">
                <div className="match-prediction-card__key-player-name">
                  <Link to={`/players/${prediction.key_players.home.bat.id}`}>
                    {prediction.key_players.home.bat.name}
                  </Link>
                </div>
                <div className="match-prediction-card__key-player-stats">
                  {prediction.key_players.home.bat.runs} runs, Avg: {prediction.key_players.home.bat.average.toFixed(2)}, SR: {prediction.key_players.home.bat.strike_rate.toFixed(2)}
                </div>
              </div>
            )}
            {prediction.key_players.home.bowl && (
              <div className="match-prediction-card__key-player-item">
                <div className="match-prediction-card__key-player-name">
                  <Link to={`/players/${prediction.key_players.home.bowl.id}`}>
                    {prediction.key_players.home.bowl.name}
                  </Link>
                </div>
                <div className="match-prediction-card__key-player-stats">
                  {prediction.key_players.home.bowl.wickets} wickets, Econ: {prediction.key_players.home.bowl.economy.toFixed(2)}, Avg: {prediction.key_players.home.bowl.average.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          
          <div className="match-prediction-card__key-player">
            <div className="match-prediction-card__key-player-team">{prediction.teams.away.name}</div>
            {prediction.key_players.away.bat && (
              <div className="match-prediction-card__key-player-item">
                <div className="match-prediction-card__key-player-name">
                  <Link to={`/players/${prediction.key_players.away.bat.id}`}>
                    {prediction.key_players.away.bat.name}
                  </Link>
                </div>
                <div className="match-prediction-card__key-player-stats">
                  {prediction.key_players.away.bat.runs} runs, Avg: {prediction.key_players.away.bat.average.toFixed(2)}, SR: {prediction.key_players.away.bat.strike_rate.toFixed(2)}
                </div>
              </div>
            )}
            {prediction.key_players.away.bowl && (
              <div className="match-prediction-card__key-player-item">
                <div className="match-prediction-card__key-player-name">
                  <Link to={`/players/${prediction.key_players.away.bowl.id}`}>
                    {prediction.key_players.away.bowl.name}
                  </Link>
                </div>
                <div className="match-prediction-card__key-player-stats">
                  {prediction.key_players.away.bowl.wickets} wickets, Econ: {prediction.key_players.away.bowl.economy.toFixed(2)}, Avg: {prediction.key_players.away.bowl.average.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="match-prediction-card__footer">
        <Link to={`/matches/${prediction.match.id}`} className="match-prediction-card__link">
          View Match Details
        </Link>
      </div>
    </Card>
  );
};

export default MatchPredictionCard;