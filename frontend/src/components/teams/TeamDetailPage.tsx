import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamsApi } from '../../services/api';
import { Team, TeamStats as TeamStatsType, MatchSummary } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Card from '../../components/common/Card';
import TeamStats from '../../components/teams/TeamStats';
import TeamRoster from '../../components/teams/TeamRoster';
import LiveScoreCard from '../../components/dashboard/LiveScoreCard';
import './TeamDetailPage.scss';

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStatsType | null>(null);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details
        const teamResponse = await teamsApi.getById(parseInt(id));
        setTeam(teamResponse.data);
        
        // Fetch team stats
        const statsResponse = await teamsApi.getStats(parseInt(id));
        setTeamStats(statsResponse.data);
        
        // Fetch team matches
        const matchesResponse = await teamsApi.getMatches(parseInt(id));
        setMatches(matchesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [id]);
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading team data..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  if (!team || !teamStats) {
    return <ErrorMessage message="Team not found" />;
  }
  
  // Split matches into upcoming and recent
  const currentDate = new Date();
  const upcomingMatches = matches.filter(match => 
    match.match_status === 'Scheduled' && new Date(match.date || '') > currentDate
  ).slice(0, 3);
  
  const recentMatches = matches.filter(match => 
    match.match_status === 'Completed'
  ).slice(0, 3);
  
  return (
    <div className="team-detail-page">
      <div className="team-detail-page__header" style={{ backgroundColor: `${team.primary_color}20` }}>
        <div className="team-detail-page__logo">
          <img src={team.logo_url || '/team-placeholder.png'} alt={team.name} />
        </div>
        <div className="team-detail-page__info">
          <h1 className="team-detail-page__name">{team.name}</h1>
          <div className="team-detail-page__stats">
            <div className="team-detail-page__stat">
              <span className="team-detail-page__stat-label">Matches</span>
              <span className="team-detail-page__stat-value">{team.matches_played}</span>
            </div>
            <div className="team-detail-page__stat">
              <span className="team-detail-page__stat-label">Won</span>
              <span className="team-detail-page__stat-value">{team.matches_won}</span>
            </div>
            <div className="team-detail-page__stat">
              <span className="team-detail-page__stat-label">Lost</span>
              <span className="team-detail-page__stat-value">{team.matches_lost}</span>
            </div>
            <div className="team-detail-page__stat">
              <span className="team-detail-page__stat-label">Points</span>
              <span className="team-detail-page__stat-value team-detail-page__stat-value--highlight" style={{ color: team.primary_color }}>
                {team.points}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="team-detail-page__content">
        <div className="team-detail-page__main">
          <TeamStats stats={teamStats} />
          
          {team.players && team.players.length > 0 && (
            <TeamRoster players={team.players} />
          )}
        </div>
        
        <div className="team-detail-page__sidebar">
          <Card title="Upcoming Matches" className="team-detail-page__matches">
            {upcomingMatches.length > 0 ? (
              <div className="team-detail-page__matches-list">
                {upcomingMatches.map(match => (
                  <Link key={match.id} to={`/matches/${match.id}`} className="team-detail-page__match-link">
                    <div className="team-detail-page__match">
                      <div className="team-detail-page__match-teams">
                        <span>{match.home_team?.short_name || 'TBA'}</span>
                        <span className="team-detail-page__match-vs">vs</span>
                        <span>{match.away_team?.short_name || 'TBA'}</span>
                      </div>
                      <div className="team-detail-page__match-info">
                        <span className="team-detail-page__match-date">
                          {match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}
                        </span>
                        <span className="team-detail-page__match-venue">{match.venue}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="team-detail-page__no-matches">No upcoming matches scheduled.</p>
            )}
          </Card>
          
          <Card title="Recent Results" className="team-detail-page__matches">
            {recentMatches.length > 0 ? (
              <div className="team-detail-page__matches-list">
                {recentMatches.map(match => (
                  <Link key={match.id} to={`/matches/${match.id}`} className="team-detail-page__match-link">
                    <div className="team-detail-page__match">
                      <div className="team-detail-page__match-teams">
                        <span className={match.result?.winner === match.home_team?.id ? 'team-detail-page__match-winner' : ''}>
                          {match.home_team?.short_name || 'TBA'}
                        </span>
                        <span className="team-detail-page__match-vs">vs</span>
                        <span className={match.result?.winner === match.away_team?.id ? 'team-detail-page__match-winner' : ''}>
                          {match.away_team?.short_name || 'TBA'}
                        </span>
                      </div>
                      <div className="team-detail-page__match-result">
                        {match.result ? (
                          <span>
                            {match.result.winner === match.home_team?.id ? match.home_team?.short_name : match.away_team?.short_name} won by {match.result.win_margin} {match.result.win_type}
                          </span>
                        ) : (
                          <span>No result</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="team-detail-page__no-matches">No recent matches found.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;