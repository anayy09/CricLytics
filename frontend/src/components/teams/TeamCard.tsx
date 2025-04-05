import React from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../../types';
import './TeamCard.scss';

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const teamStyle = {
    borderColor: team.primary_color || '#4CAF50',
    backgroundColor: `${team.primary_color}10` || '#4CAF5010',
  };
  
  return (
    <Link to={`/teams/${team.id}`} className="team-card" style={teamStyle}>
      <div className="team-card__logo">
        <img src={team.logo_url || '/team-placeholder.png'} alt={team.name} />
      </div>
      <div className="team-card__info">
        <h3 className="team-card__name">{team.name}</h3>
        <div className="team-card__stats">
          <div className="team-card__stat">
            <span className="team-card__stat-label">Matches</span>
            <span className="team-card__stat-value">{team.matches_played}</span>
          </div>
          <div className="team-card__stat">
            <span className="team-card__stat-label">Won</span>
            <span className="team-card__stat-value">{team.matches_won}</span>
          </div>
          <div className="team-card__stat">
            <span className="team-card__stat-label">Points</span>
            <span className="team-card__stat-value team-card__stat-value--highlight">{team.points}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TeamCard;