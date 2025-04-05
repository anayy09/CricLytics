import React from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../../types';
import Card from '../common/Card';
import './PointsTable.scss';

interface PointsTableProps {
  teams: Team[];
}

const PointsTable: React.FC<PointsTableProps> = ({ teams }) => {
  // Sort teams by points, then by NRR
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.net_run_rate - a.net_run_rate;
  });
  
  return (
    <Card title="Points Table" className="points-table">
      <div className="points-table__container">
        <table className="points-table__table">
          <thead>
            <tr>
              <th>Pos</th>
              <th className="points-table__team-col">Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>NRR</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id} className={index < 4 ? 'points-table__playoff-position' : ''}>
                <td>{index + 1}</td>
                <td className="points-table__team-col">
                  <Link to={`/teams/${team.id}`} className="points-table__team-link">
                    <div className="points-table__team">
                      <div className="points-table__team-logo">
                        <img src={team.logo_url || '/team-placeholder.png'} alt={team.name} />
                      </div>
                      <span>{team.short_name}</span>
                    </div>
                  </Link>
                </td>
                <td>{team.matches_played}</td>
                <td>{team.matches_won}</td>
                <td>{team.matches_lost}</td>
                <td>{team.net_run_rate.toFixed(3)}</td>
                <td className="points-table__points">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="points-table__legend">
        <div className="points-table__legend-item points-table__playoff-position">
          <span className="points-table__legend-color"></span>
          <span>Playoff Qualification</span>
        </div>
      </div>
    </Card>
  );
};

export default PointsTable;