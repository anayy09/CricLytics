import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import './MatchCard.scss';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getMatchStatus = () => {
    if (match.match_status === 'Live') {
      return <span className="match-card__status match-card__status--live">LIVE</span>;
    } else if (match.match_status === 'Completed') {
      return <span className="match-card__status match-card__status--completed">COMPLETED</span>;
    } else {
      return (
        <span className="match-card__status match-card__status--scheduled">
          {match.date ? new Date(match.date).toLocaleDateString() : 'UPCOMING'}
        </span>
      );
    }
  };
  
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
    <Link to={`/matches/${match.id}`} className="match-card">
      <div className="match-card__header">
        <div className="match-card__venue">
          <i className="fas fa-map-marker-alt"></i> {match.venue}, {match.city}
        </div>
        {getMatchStatus()}
      </div>
      
      <div className="match-card__teams">
        <div className="match-card__team">
          <div className="match-card__team-logo">
            <img 
              src={match.home_team?.logo_url || '/team-placeholder.png'} 
              alt={match.home_team?.name || 'Home Team'} 
            />
          </div>
          <div className="match-card__team-name">
            {match.home_team?.name || 'Home Team'}
          </div>
          <div className="match-card__team-score">
            {getScoreDisplay(homeTeamScore)}
          </div>
        </div>
        
        <div className="match-card__vs">VS</div>
        
        <div className="match-card__team">
          <div className="match-card__team-logo">
            <img 
              src={match.away_team?.logo_url || '/team-placeholder.png'} 
              alt={match.away_team?.name || 'Away Team'} 
            />
          </div>
          <div className="match-card__team-name">
            {match.away_team?.name || 'Away Team'}
          </div>
          <div className="match-card__team-score">
            {getScoreDisplay(awayTeamScore)}
          </div>
        </div>
      </div>
      
      {match.match_status === 'Completed' && match.result && (
        <div className="match-card__result">
          {getMatchResult()}
        </div>
      )}
      
      {match.match_status === 'Scheduled' && (
        <div className="match-card__time">
          {match.date ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
        </div>
      )}
    </Link>
  );
};

export default MatchCard;