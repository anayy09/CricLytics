import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playersApi, predictionsApi } from '../../services/api';
import { Player, PlayerStats as PlayerStatsType, MatchSummary, PlayerPrediction } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Card from '../../components/common/Card';
import PlayerStats from '../../components/players/PlayerStats';
import './PlayerDetailPage.scss';

const PlayerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStatsType | null>(null);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [prediction, setPrediction] = useState<PlayerPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch player details
        const playerResponse = await playersApi.getById(parseInt(id));
        setPlayer(playerResponse.data);
        
        // Fetch player stats
        const statsResponse = await playersApi.getStats(parseInt(id));
        setPlayerStats(statsResponse.data);
        
        // Fetch player matches
        const matchesResponse = await playersApi.getMatches(parseInt(id));
        setMatches(matchesResponse.data);
        
        // Fetch player prediction
        const predictionResponse = await predictionsApi.getPlayerPerformance(parseInt(id));
        setPrediction(predictionResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError('Failed to load player data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [id]);
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading player data..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  if (!player || !playerStats) {
    return <ErrorMessage message="Player not found" />;
  }
  
  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'N/A';
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };
  
  return (
    <div className="player-detail-page">
      <div className="player-detail-page__header">
        <div className="player-detail-page__image">
          <img src={player.image_url || '/player-placeholder.png'} alt={player.name} />
        </div>
        <div className="player-detail-page__info">
          <h1 className="player-detail-page__name">{player.name}</h1>
          <div className="player-detail-page__meta">
            <div className="player-detail-page__meta-item">
              <span className="player-detail-page__meta-label">Role</span>
              <span className="player-detail-page__meta-value">{player.role}</span>
            </div>
            <div className="player-detail-page__meta-item">
              <span className="player-detail-page__meta-label">Team</span>
              <span className="player-detail-page__meta-value">
                {player.teams.map(team => (
                  <Link key={team.id} to={`/teams/${team.id}`} className="player-detail-page__team-link">
                    {team.name}
                  </Link>
                ))}
              </span>
            </div>
            <div className="player-detail-page__meta-item">
              <span className="player-detail-page__meta-label">Country</span>
              <span className="player-detail-page__meta-value">{player.country}</span>
            </div>
            <div className="player-detail-page__meta-item">
              <span className="player-detail-page__meta-label">Age</span>
              <span className="player-detail-page__meta-value">{getAge(player.date_of_birth)}</span>
            </div>
            <div className="player-detail-page__meta-item">
              <span className="player-detail-page__meta-label">Batting</span>
              <span className="player-detail-page__meta-value">{player.batting_style || 'N/A'}</span>
            </div>
            <div className="player-detail-page__meta-item">
              <span className="player-detail-page__meta-label">Bowling</span>
              <span className="player-detail-page__meta-value">{player.bowling_style || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="player-detail-page__content">
        <div className="player-detail-page__main">
          <PlayerStats stats={playerStats} />
        </div>
        
        <div className="player-detail-page__sidebar">
          {prediction && (
            <Card title="Performance Prediction" className="player-detail-page__prediction">
              <div className="player-detail-page__prediction-content">
                <div className="player-detail-page__prediction-section">
                  <h4 className="player-detail-page__prediction-title">Batting</h4>
                  <div className="player-detail-page__prediction-stats">
                    <div className="player-detail-page__prediction-stat">
                      <span className="player-detail-page__prediction-label">Runs</span>
                      <span className="player-detail-page__prediction-value">{prediction.prediction.batting.runs}</span>
                    </div>
                    <div className="player-detail-page__prediction-stat">
                      <span className="player-detail-page__prediction-label">Strike Rate</span>
                      <span className="player-detail-page__prediction-value">{prediction.prediction.batting.strike_rate}</span>
                    </div>
                    <div className="player-detail-page__prediction-stat">
                      <span className="player-detail-page__prediction-label">Boundaries %</span>
                      <span className="player-detail-page__prediction-value">{prediction.prediction.batting.boundary_percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="player-detail-page__prediction-section">
                  <h4 className="player-detail-page__prediction-title">Bowling</h4>
                  <div className="player-detail-page__prediction-stats">
                    <div className="player-detail-page__prediction-stat">
                      <span className="player-detail-page__prediction-label">Wickets</span>
                      <span className="player-detail-page__prediction-value">{prediction.prediction.bowling.wickets}</span>
                    </div>
                    <div className="player-detail-page__prediction-stat">
                      <span className="player-detail-page__prediction-label">Economy</span>
                      <span className="player-detail-page__prediction-value">{prediction.prediction.bowling.economy_rate}</span>
                    </div>
                    <div className="player-detail-page__prediction-stat">
                      <span className="player-detail-page__prediction-label">Dot Balls %</span>
                      <span className="player-detail-page__prediction-value">{prediction.prediction.bowling.dot_ball_percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="player-detail-page__prediction-confidence">
                  <div className="player-detail-page__confidence-item">
                    <span className="player-detail-page__confidence-label">Batting Confidence</span>
                    <div className="player-detail-page__confidence-bar">
                      <div 
                        className="player-detail-page__confidence-fill" 
                        style={{ width: `${prediction.confidence.batting}%` }}
                      ></div>
                    </div>
                    <span className="player-detail-page__confidence-value">{prediction.confidence.batting.toFixed(0)}%</span>
                  </div>
                  
                  <div className="player-detail-page__confidence-item">
                    <span className="player-detail-page__confidence-label">Bowling Confidence</span>
                    <div className="player-detail-page__confidence-bar">
                      <div 
                        className="player-detail-page__confidence-fill" 
                        style={{ width: `${prediction.confidence.bowling}%` }} ></div>
                    </div>
                    <span className="player-detail-page__confidence-value">{prediction.confidence.bowling.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <Card title="Recent Performances" className="player-detail-page__recent">
            {player.recent_performances ? (
              <div className="player-detail-page__performances">
                {player.recent_performances.batting.length > 0 && (
                  <div className="player-detail-page__performance-section">
                    <h4 className="player-detail-page__performance-title">Batting</h4>
                    <table className="player-detail-page__performance-table">
                      <thead>
                        <tr>
                          <th>Against</th>
                          <th>Runs</th>
                          <th>Balls</th>
                          <th>4s</th>
                          <th>6s</th>
                          <th>SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {player.recent_performances.batting.map((perf, index) => (
                          <tr key={index}>
                            <td>{perf.against}</td>
                            <td className="player-detail-page__performance-runs">{perf.runs}</td>
                            <td>{perf.balls_faced}</td>
                            <td>{perf.fours}</td>
                            <td>{perf.sixes}</td>
                            <td>{perf.strike_rate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {player.recent_performances.bowling.length > 0 && (
                  <div className="player-detail-page__performance-section">
                    <h4 className="player-detail-page__performance-title">Bowling</h4>
                    <table className="player-detail-page__performance-table">
                      <thead>
                        <tr>
                          <th>Against</th>
                          <th>Overs</th>
                          <th>Maidens</th>
                          <th>Runs</th>
                          <th>Wickets</th>
                          <th>Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {player.recent_performances.bowling.map((perf, index) => (
                          <tr key={index}>
                            <td>{perf.against}</td>
                            <td>{perf.overs}</td>
                            <td>{perf.maidens}</td>
                            <td>{perf.runs}</td>
                            <td className="player-detail-page__performance-wickets">{perf.wickets}</td>
                            <td>{perf.economy_rate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <p className="player-detail-page__no-data">No recent performance data available.</p>
            )}
          </Card>
          
          <Card title="Upcoming Matches" className="player-detail-page__matches">
            {matches.filter(m => m.match_status === 'Scheduled').length > 0 ? (
              <div className="player-detail-page__matches-list">
                {matches
                  .filter(m => m.match_status === 'Scheduled')
                  .slice(0, 3)
                  .map(match => (
                    <Link key={match.id} to={`/matches/${match.id}`} className="player-detail-page__match-link">
                      <div className="player-detail-page__match">
                        <div className="player-detail-page__match-teams">
                          <span>{match.home_team?.short_name || 'TBA'}</span>
                          <span className="player-detail-page__match-vs">vs</span>
                          <span>{match.away_team?.short_name || 'TBA'}</span>
                        </div>
                        <div className="player-detail-page__match-info">
                          <span className="player-detail-page__match-date">
                            {match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}
                          </span>
                          <span className="player-detail-page__match-venue">{match.venue}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <p className="player-detail-page__no-matches">No upcoming matches scheduled.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailPage;