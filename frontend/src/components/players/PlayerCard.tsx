import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '../../types';
import './PlayerCard.scss';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const getTeamColor = () => {
    if (player.teams && player.teams.length > 0) {
      // This would ideally come from the team data
      return '#4CAF50';
    }
    return '#4CAF50';
  };
  
  const cardStyle = {
    borderColor: getTeamColor(),
  };
  
  return (
    <Link to={`/players/${player.id}`} className="player-card" style={cardStyle}>
      <div className="player-card__image">
        <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
      </div>
      <div className="player-card__content">
        <h3 className="player-card__name">{player.name}</h3>
        <div className="player-card__info">
          <span className="player-card__role">{player.role}</span>
          {player.teams && player.teams.length > 0 && (
            <span className="player-card__team">{player.teams[0].short_name}</span>
          )}
        </div>
        <div className="player-card__stats">
          {player.role === 'Batsman' || player.role === 'All-rounder' || player.role === 'Wicket-keeper' ? (
            <div className="player-card__stat">
              <span className="player-card__stat-label">Runs</span>
              <span className="player-card__stat-value">{player.stats.batting.runs}</span>
            </div>
          ) : null}
          
          {player.role === 'Bowler' || player.role === 'All-rounder' ? (
            <div className="player-card__stat">
              <span className="player-card__stat-label">Wickets</span>
              <span className="player-card__stat-value">{player.stats.bowling.wickets}</span>
            </div>
          ) : null}
          
          {player.role === 'Batsman' || player.role === 'All-rounder' || player.role === 'Wicket-keeper' ? (
            <div className="player-card__stat">
              <span className="player-card__stat-label">Avg</span>
              <span className="player-card__stat-value">{player.stats.batting.average.toFixed(2)}</span>
            </div>
          ) : null}
          
          {player.role === 'Bowler' || player.role === 'All-rounder' ? (
            <div className="player-card__stat">
              <span className="player-card__stat-label">Econ</span>
              <span className="player-card__stat-value">{player.stats.bowling.economy_rate.toFixed(2)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default PlayerCard;