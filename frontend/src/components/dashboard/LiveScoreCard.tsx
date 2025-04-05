import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import Card from '../common/Card';
import './LiveScoreCard.scss';

interface LiveScoreCardProps {
  match: Match;
}

const LiveScoreCard: React.FC<LiveScoreCardProps> = ({ match }) => {
  const getTeamScore = (teamId: number) => {
    if (!match.scores) return null;
    
    const isFirstInningsBattingTeam = match.innings && match.innings[0]?.batting_team.id === teamId;
    
    if (isFirstInningsBattingTeam) {
      return match.scores.first_innings;
    } else {
      return match.scores.second_innings;
    }
  };
  
  const homeTeamScore = match.home_team ? getTeamScore(match.home_team.id) : null;
  const awayTeamScore = match.away_team ? getTeamScore(match.away_team.id) : null;
  
  const getScoreDisplay = (score: { score: number; wickets: number; overs: number } | null) => {
    if (!score) return '-';
    return `${score.score}/${score.wickets} (${score.overs.toFixed(1)})`;
  };
  
  const getMatchStatus = () => {
    if (match.match_status === 'Live') {
      return 'LIVE';
    } else if (match.match_status === 'Completed') {
      if (match.result) {
        const winnerName = match.result.winner === match.home_team?.id 
          ? match.home_team?.name 
          : match.away_team?.name;
        return `${winnerName} won by ${match.result.win_margin} ${match.result.win_type}`;
      }
      return 'Match Completed';
    } else {
      return match.date ? new Date(match.date).toLocaleDateString() : 'Upcoming';
    }
  };
  
  return (
    <Card className="live-score-card">
      <Link to={`/matches/${match.id}`} className="live-score-card__link">
        <div className="live-score-card__header">
          <span className="live-score-card__venue">{match.venue}</span>
          <span className={`live-score-card__status ${match.match_status.toLowerCase()}`}>
            {match.match_status === 'Live' && '🔴 '}
            {getMatchStatus()}
          </span>
        </div>
        
        <div className="live-score-card__teams">
          <div className="live-score-card__team">
            <div className="live-score-card__team-logo">
              <img 
                src={match.home_team?.logo_url || '/team-placeholder.png'} 
                alt={match.home_team?.name || 'Home Team'} 
              />
            </div>
            <div className="live-score-card__team-name">
              {match.home_team?.name || 'Home Team'}
            </div>
            <div className="live-score-card__team-score">
              {getScoreDisplay(homeTeamScore)}
            </div>
          </div>
          
          <div className="live-score-card__vs">VS</div>
          
          <div className="live-score-card__team">
            <div className="live-score -card__team-logo">
              <img 
                src={match.away_team?.logo_url || '/team-placeholder.png'} 
                alt={match.away_team?.name || 'Away Team'} 
              />
            </div>
            <div className="live-score-card__team-name">
              {match.away_team?.name || 'Away Team'}
            </div>
            <div className="live-score-card__team-score">
              {getScoreDisplay(awayTeamScore)}
            </div>
          </div>
        </div>
        
        {match.match_status === 'Live' && match.innings && match.innings.length > 0 && (
          <div className="live-score-card__current-play">
            <div className="live-score-card__batsmen">
              {match.innings[match.innings.length - 1].batting_performances
                .filter(bp => bp.batting_position <= 2)
                .map(bp => (
                  <div key={bp.player?.id} className="live-score-card__batsman">
                    <span className="name">{bp.player?.name}</span>
                    <span className="score">{bp.runs} ({bp.balls_faced})</span>
                  </div>
                ))
              }
            </div>
            <div className="live-score-card__bowler">
              {match.innings[match.innings.length - 1].bowling_performances
                .slice(0, 1)
                .map(bp => (
                  <div key={bp.player?.id} className="live-score-card__bowler-info">
                    <span className="name">{bp.player?.name}</span>
                    <span className="figures">{bp.wickets}/{bp.runs} ({bp.overs})</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </Link>
    </Card>
  );
};

export default LiveScoreCard;