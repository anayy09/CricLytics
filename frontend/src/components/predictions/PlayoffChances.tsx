import React from 'react';
import { PlayoffPrediction } from '../../types';
import Card from '../common/Card';
import './PlayoffChances.scss';

interface PlayoffChancesProps {
  prediction: PlayoffPrediction;
}

const PlayoffChances: React.FC<PlayoffChancesProps> = ({ prediction }) => {
  // Sort teams by playoff chance
  const sortedTeams = [...prediction.teams].sort((a, b) => b.playoff_chance - a.playoff_chance);
  
  return (
    <Card title="Playoff Chances" className="playoff-chances">
      <div className="playoff-chances__cutoff">
        <span className="playoff-chances__cutoff-label">Playoff Cutoff (Estimated):</span>
        <span className="playoff-chances__cutoff-value">{prediction.playoff_cutoff} points</span>
      </div>
      
      <div className="playoff-chances__table-container">
        <table className="playoff-chances__table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Points</th>
              <th>Max Points</th>
              <th>Remaining</th>
              <th>Playoff Chance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map(team => (
              <tr key={team.team.id} className={`playoff-chances__team playoff-chances__team--${team.status.toLowerCase()}`}>
                <td className="playoff-chances__team-name">{team.team.name}</td>
                <td>{team.current_points}</td>
                <td>{team.max_possible_points}</td>
                <td>{team.remaining_matches}</td>
                <td className="playoff-chances__percentage">
                  <div className="playoff-chances__percentage-bar">
                    <div 
                      className="playoff-chances__percentage-fill" 
                      style={{ width: `${team.playoff_chance}%` }}
                    ></div>
                  </div>
                  <span className="playoff-chances__percentage-value">
                    {team.playoff_chance.toFixed(1)}%
                  </span>
                </td>
                <td className="playoff-chances__status">
                  <span className={`playoff-chances__status-badge playoff-chances__status-badge--${team.status.toLowerCase()}`}>
                    {team.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="playoff-chances__legend">
        <div className="playoff-chances__legend-item">
          <span className="playoff-chances__legend-color playoff-chances__legend-color--qualified"></span>
          <span>Qualified</span>
        </div>
        <div className="playoff-chances__legend-item">
          <span className="playoff-chances__legend-color playoff-chances__legend-color--contention"></span>
          <span>In Contention</span>
        </div>
        <div className="playoff-chances__legend-item">
          <span className="playoff-chances__legend-color playoff-chances__legend-color--eliminated"></span>
          <span>Eliminated</span>
        </div>
      </div>
    </Card>
  );
};

export default PlayoffChances;