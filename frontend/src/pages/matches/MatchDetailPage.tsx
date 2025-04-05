import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { matchesApi, predictionsApi } from '../../services/api';
import { Match, Commentary as CommentaryType, WinProbability } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ScoreCard from '../../components/matches/ScoreCard';
import Commentary from '../../components/matches/Commentary';
import WinProbabilityMeter from '../../components/dashboard/WinProbabilityMeter';
import './MatchDetailPage.scss';

const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [commentary, setCommentary] = useState<CommentaryType[]>([]);
  const [winProbability, setWinProbability] = useState<WinProbability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary'>('scorecard');
  
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch match details
        const matchResponse = await matchesApi.getById(parseInt(id));
        setMatch(matchResponse.data);
        
        // Fetch commentary
        const commentaryResponse = await matchesApi.getCommentary(parseInt(id));
        setCommentary(commentaryResponse.data);
        
        // Fetch win probability if match is live
        if (matchResponse.data.match_status === 'Live') {
          const winProbResponse = await matchesApi.getWinProbability(parseInt(id));
          setWinProbability(winProbResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching match data:', err);
        setError('Failed to load match data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMatchData();
    
    // Set up polling for live match
    const interval = setInterval(() => {
      if (match && match.match_status === 'Live') {
        // Refresh match data and commentary
        matchesApi.getById(parseInt(id!)).then(response => setMatch(response.data));
        matchesApi.getCommentary(parseInt(id!)).then(response => setCommentary(response.data));
        matchesApi.getWinProbability(parseInt(id!)).then(response => setWinProbability(response.data));
      }
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [id]);
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading match data..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  if (!match) {
    return <ErrorMessage message="Match not found" />;
  }
  
  const getTeamScore = (teamId: number) => {
    if (!match.scores) return null;
    
    const isFirstInningsBattingTeam = match.innings && match.innings[0]?.batting_team.id === teamId;
    
    if (isFirstInningsBattingTeam) {
      return match.scores.first_innings;
    } else {
      return match.scores.second_innings;
    }
  };
  
  const getScoreDisplay = (score: { score: number; wickets: number; overs: number } | null) => {
    if (!score) return '-';
    return `${score.score}/${score.wickets} (${score.overs.toFixed(1)})`;
  };
  
  const getMatchStatus = () => {
    if (match.match_status === 'Live') {
      return <span className="match-detail-page__status match-detail-page__status--live">LIVE</span>;
    } else if (match.match_status === 'Completed') {
      return <span className="match-detail-page__status match-detail-page__status--completed">COMPLETED</span>;
    } else {
      return (
        <span className="match-detail-page__status match-detail-page__status--scheduled">
          {match.date ? new Date(match.date).toLocaleDateString() : 'UPCOMING'}
        </span>
      );
    }
  };
  
  const getMatchResult = () => {
    if (match.match_status !== 'Completed' || !match.result) return null;
    
    const winnerName = match.result.winner === match.home_team?.id 
      ? match.home_team?.name 
      : match.away_team?.name;
    
    return `${winnerName} won by ${match.result.win_margin} ${match.result.win_type}`;
  };
  
  const homeTeamScore = match.home_team ? getTeamScore(match.home_team.id) : null;
  const awayTeamScore = match.away_team ? getTeamScore(match.away_team.id) : null;
  
  return (
    <div className="match-detail-page">
      <div className="match-detail-page__header">
        <div className="match-detail-page__venue">
          <i className="fas fa-map-marker-alt"></i> {match.venue}, {match.city}
        </div>
        {getMatchStatus()}
      </div>
      
      <div className="match-detail-page__teams">
        <div className="match-detail-page__team">
          <div className="match-detail-page__team-logo">
            <img 
              src={match.home_team?.logo_url || '/team-placeholder.png'} 
              alt={match.home_team?.name || 'Home Team'} 
            />
          </div>
          <div className="match-detail-page__team-name">
            {match.home_team?.name || 'Home Team'}
          </div>
          <div className="match-detail-page__team-score">
            {getScoreDisplay(homeTeamScore)}
          </div>
        </div>
        
        <div className="match-detail-page__vs">VS</div>
        
        <div className="match-detail-page__team">
          <div className="match-detail-page__team-logo">
            <img 
              src={match.away_team?.logo_url || '/team-placeholder.png'} 
              alt={match.away_team?.name || 'Away Team'} 
            />
          </div>
          <div className="match-detail-page__team-name">
            {match.away_team?.name || 'Away Team'}
          </div>
          <div className="match-detail-page__team-score">
            {getScoreDisplay(awayTeamScore)}
          </div>
        </div>
      </div>
      
      {match.match_status === 'Completed' && match.result && (
        <div className="match-detail-page__result">
          {getMatchResult()}
        </div>
      )}
      
      {match.match_status === 'Scheduled' && (
        <div className="match-detail-page__time">
          {match.date ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
        </div>
      )}
      
      {match.match_status === 'Live' && winProbability && (
        <div className="match-detail-page__win-probability">
          <WinProbabilityMeter 
            winProbability={winProbability} 
            homeTeam={match.home_team ? { name: match.home_team.name, primary_color: "#1a73e8" } : null}
            awayTeam={match.away_team ? { name: match.away_team.name, primary_color: "#e53935" } : null}
          />
        </div>
      )}
      
      {(match.match_status === 'Live' || match.match_status === 'Completed') && (
        <div className="match-detail-page__content">
          <div className="match-detail-page__tabs">
            <button 
              className={`match-detail-page__tab ${activeTab === 'scorecard' ? 'match-detail-page__tab--active' : ''}`}
              onClick={() => setActiveTab('scorecard')}
            >
              Scorecard
            </button>
            <button 
              className={`match-detail-page__tab ${activeTab === 'commentary' ? 'match-detail-page__tab--active' : ''}`}
              onClick={() => setActiveTab('commentary')}
            >
              Commentary
            </button>
          </div>
          
          <div className="match-detail-page__tab-content">
            {activeTab === 'scorecard' && match.innings && match.innings.length > 0 ? (
              <div className="match-detail-page__scorecard">
                {match.innings.map(innings => (
                  <ScoreCard key={innings.innings_number} innings={innings} />
                ))}
              </div>
            ) : null}
            
            {activeTab === 'commentary' && (
              <div className="match-detail-page__commentary">
                <Commentary commentary={commentary} />
              </div>
            )}
          </div>
        </div>
      )}
      
      {match.match_status === 'Scheduled' && (
        <div className="match-detail-page__info">
          <div className="match-detail-page__info-item">
            <span className="match-detail-page__info-label">Date</span>
            <span className="match-detail-page__info-value">
              {match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          <div className="match-detail-page__info-item">
            <span className="match-detail-page__info-label">Time</span>
            <span className="match-detail-page__info-value">
              {match.date ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
            </span>
          </div>
          <div className="match-detail-page__info-item">
            <span className="match-detail-page__info-label">Venue</span>
            <span className="match-detail-page__info-value">{match.venue}</span>
          </div>
          <div className="match-detail-page__info-item">
            <span className="match-detail-page__info-label">City</span>
            <span className="match-detail-page__info-value">{match.city}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetailPage;