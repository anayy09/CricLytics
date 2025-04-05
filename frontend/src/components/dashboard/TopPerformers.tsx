import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '../../types';
import Card from '../common/Card';
import './TopPerformers.scss';

interface TopPerformersProps {
  topBatsmen: Player[];
  topBowlers: Player[];
}

const TopPerformers: React.FC<TopPerformersProps> = ({ topBatsmen, topBowlers }) => {
  return (
    <div className="top-performers">
      <Card title="Top Run Scorers" className="top-performers__card">
        <div className="top-performers__list">
          <table className="top-performers__table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Runs</th>
                <th>Avg</th>
                <th>SR</th>
              </tr>
            </thead>
            <tbody>
              {topBatsmen.map(player => (
                <tr key={player.id}>
                  <td>
                    <Link to={`/players/${player.id}`} className="top-performers__player">
                      <div className="top-performers__player-img">
                        <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
                      </div>
                      <div className="top-performers__player-info">
                        <span className="top-performers__player-name">{player.name}</span>
                        <span className="top-performers__player-team">
                          {player.teams[0]?.short_name || ''}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="top-performers__stat top-performers__stat--primary">
                    {player.stats.batting.runs}
                  </td>
                  <td className="top-performers__stat">
                    {player.stats.batting.average.toFixed(2)}
                  </td>
                  <td className="top-performers__stat">
                    {player.stats.batting.strike_rate.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="top-performers__footer">
          <Link to="/players?sort=runs" className="top-performers__view-all">
            View All
          </Link>
        </div>
      </Card>
      
      <Card title="Top Wicket Takers" className="top-performers__card">
        <div className="top-performers__list">
          <table className="top-performers__table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Wkts</th>
                <th>Avg</th>
                <th>Econ</th>
              </tr>
            </thead>
            <tbody>
              {topBowlers.map(player => (
                <tr key={player.id}>
                  <td>
                    <Link to={`/players/${player.id}`} className="top-performers__player">
                      <div className="top-performers__player-img">
                        <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
                      </div>
                      <div className="top-performers__player-info">
                        <span className="top-performers__player-name">{player.name}</span>
                        <span className="top-performers__player-team">
                          {player.teams[0]?.short_name || ''}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="top-performers__stat top-performers__stat--primary">
                    {player.stats.bowling.wickets}
                  </td>
                  <td className="top-performers__stat">
                    {player.stats.bowling.average.toFixed(2)}
                  </td>
                  <td className="top-performers__stat">
                    {player.stats.bowling.economy_rate.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="top-performers__footer">
          <Link to="/players?sort=wickets" className="top-performers__view-all">
            View All
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default TopPerformers;