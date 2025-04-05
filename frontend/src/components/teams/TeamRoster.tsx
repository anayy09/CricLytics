import React from 'react';
import { Link } from 'react-router-dom';
import { PlayerSummary } from '../../types';
import Card from '../common/Card';
import './TeamRoster.scss';

interface TeamRosterProps {
  players: PlayerSummary[];
}

const TeamRoster: React.FC<TeamRosterProps> = ({ players }) => {
  // Group players by role
  const batsmen = players.filter(p => p.role === 'Batsman');
  const bowlers = players.filter(p => p.role === 'Bowler');
  const allRounders = players.filter(p => p.role === 'All-rounder');
  const wicketKeepers = players.filter(p => p.role === 'Wicket-keeper');
  
  return (
    <Card title="Team Roster" className="team-roster">
      <div className="team-roster__sections">
        <div className="team-roster__section">
          <h3 className="team-roster__section-title">Batsmen</h3>
          <div className="team-roster__players">
            {batsmen.map(player => (
              <Link key={player.id} to={`/players/${player.id}`} className="team-roster__player">
                <div className="team-roster__player-img">
                  <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
                </div>
                <div className="team-roster__player-info">
                  <span className="team-roster__player-name">{player.name}</span>
                  <span className="team-roster__player-role">{player.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="team-roster__section">
          <h3 className="team-roster__section-title">Bowlers</h3>
          <div className="team-roster__players">
            {bowlers.map(player => (
              <Link key={player.id} to={`/players/${player.id}`} className="team-roster__player">
                <div className="team-roster__player-img">
                  <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
                </div>
                <div className="team-roster__player-info">
                  <span className="team-roster__player-name">{player.name}</span>
                  <span className="team-roster__player-role">{player.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="team-roster__section">
          <h3 className="team-roster__section-title">All-Rounders</h3>
          <div className="team-roster__players">
            {allRounders.map(player => (
              <Link key={player.id} to={`/players/${player.id}`} className="team-roster__player">
                <div className="team-roster__player-img">
                  <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
                </div>
                <div className="team-roster__player-info">
                  <span className="team-roster__player-name">{player.name}</span>
                  <span className="team-roster__player-role">{player.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="team-roster__section">
          <h3 className="team-roster__section-title">Wicket-Keepers</h3>
          <div className="team-roster__players">
            {wicketKeepers.map(player => (
              <Link key={player.id} to={`/players/${player.id}`} className="team-roster__player">
                <div className="team-roster__player-img">
                  <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
                </div>
                <div className="team-roster__player-info">
                  <span className="team-roster__player-name">{player.name}</span>
                  <span className="team-roster__player-role">{player.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamRoster;