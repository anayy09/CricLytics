import React from 'react';
import { Innings } from '../../types';
import Card from '../common/Card';
import './ScoreCard.scss';

interface ScoreCardProps {
  innings: Innings;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ innings }) => {
  return (
    <Card title={`Innings ${innings.innings_number}: ${innings.batting_team.name}`} className="score-card">
      <div className="score-card__summary">
        <div className="score-card__total">
          <span className="score-card__score">{innings.total_runs}/{innings.total_wickets}</span>
          <span className="score-card__overs">({innings.total_overs} Overs)</span>
        </div>
        <div className="score-card__extras">
          <span>Extras: {innings.extras}</span>
        </div>
      </div>
      
      <div className="score-card__batting">
        <h4 className="score-card__section-title">Batting</h4>
        <div className="score-card__table-container">
          <table className="score-card__table">
            <thead>
              <tr>
                <th>Batter</th>
                <th>Dismissal</th>
                <th>R</th>
                <th>B</th>
                <th>4s</th>
                <th>6s</th>
                <th>SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batting_performances.map((performance, index) => (
                <tr key={index}>
                  <td className="score-card__player-name">
                    {performance.player?.name || 'Unknown Player'}
                  </td>
                  <td className="score-card__dismissal">
                    {performance.dismissal_type || 'not out'}
                  </td>
                  <td className="score-card__runs">{performance.runs}</td>
                  <td>{performance.balls_faced}</td>
                  <td>{performance.fours}</td>
                  <td>{performance.sixes}</td>
                  <td>{performance.strike_rate.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="score-card__bowling">
        <h4 className="score-card__section-title">Bowling</h4>
        <div className="score-card__table-container">
          <table className="score-card__table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>O</th>
                <th>M</th>
                <th>R</th>
                <th>W</th>
                <th>Econ</th>
                <th>Dots</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowling_performances.map((performance, index) => (
                <tr key={index}>
                  <td className="score-card__player-name">
                    {performance.player?.name || 'Unknown Player'}
                  </td>
                  <td>{performance.overs}</td>
                  <td>{performance.maidens}</td>
                  <td>{performance.runs}</td>
                  <td className="score-card__wickets">{performance.wickets}</td>
                  <td>{performance.economy_rate.toFixed(2)}</td>
                  <td>{performance.dot_balls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default ScoreCard;