import React, { useState, useEffect } from 'react';
import { matchesApi, teamsApi, playersApi } from '../../services/api';
import { Match, Team, Player, WinProbability } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import LiveScoreCard from '../../components/dashboard/LiveScoreCard';
import WinProbabilityMeter from '../../components/dashboard/WinProbabilityMeter';
import PointsTable from '../../components/dashboard/PointsTable';
import TopPerformers from '../../components/dashboard/TopPerformers';
import './DashboardPage.scss';

const DashboardPage: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [topBatsmen, setTopBatsmen] = useState<Player[]>([]);
  const [topBowlers, setTopBowlers] = useState<Player[]>([]);
  const [winProbability, setWinProbability] = useState<WinProbability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch live matches
        const liveMatchesResponse = await matchesApi.getLive();
        setLiveMatches(liveMatchesResponse.data);
        
        // Fetch upcoming matches
        const upcomingMatchesResponse = await matchesApi.getUpcoming(3); // Next 3 days
        setUpcomingMatches(upcomingMatchesResponse.data);
        
        // Fetch recent matches
        const recentMatchesResponse = await matchesApi.getRecent(3); // Last 3 days
        setRecentMatches(recentMatchesResponse.data);
        
        // Fetch teams for points table
        const teamsResponse = await teamsApi.getAll();
        setTeams(teamsResponse.data);
        
        // Fetch top batsmen
        const topBatsmenResponse = await playersApi.getTopBatsmen(5);
        setTopBatsmen(topBatsmenResponse.data);
        
        // Fetch top bowlers
        const topBowlersResponse = await playersApi.getTopBowlers(5);
        setTopBowlers(topBowlersResponse.data);
        
        // If there's a live match, fetch win probability
        if (liveMatchesResponse.data.length > 0) {
          const winProbResponse = await matchesApi.getWinProbability(liveMatchesResponse.data[0].id);
          setWinProbability(winProbResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up polling for live data
    const interval = setInterval(() => {
      if (liveMatches.length > 0) {
        // Refresh live matches and win probability
        matchesApi.getLive().then(response => setLiveMatches(response.data));
        matchesApi.getWinProbability(liveMatches[0].id).then(response => setWinProbability(response.data));
      }
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading dashboard data..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  return (
    <div className="dashboard-page">
      <section className="dashboard-page__section">
        <h2 className="dashboard-page__section-title">Live Matches</h2>
        {liveMatches.length > 0 ? (
          <div className="dashboard-page__live">
            <div className="dashboard-page__live-match">
              <LiveScoreCard match={liveMatches[0]} />
              {winProbability && (
                <WinProbabilityMeter 
                  winProbability={winProbability} 
                  homeTeam={{
                    name: liveMatches[0].home_team?.name || "",
                    primary_color: liveMatches[0].home_team?.short_name ? "#1a73e8" : "#cccccc" // Using a default color
                  }}
                  awayTeam={{
                    name: liveMatches[0].away_team?.name || "",
                    primary_color: liveMatches[0].away_team?.short_name ? "#e53935" : "#cccccc" // Using a default color
                  }}
                />
              )}
            </div>
            {liveMatches.length > 1 && (
              <div className="dashboard-page__other-live">
                {liveMatches.slice(1).map(match => (
                  <LiveScoreCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="dashboard-page__no-matches">
            <p>No live matches at the moment.</p>
          </div>
        )}
      </section>
      
      <section className="dashboard-page__section">
        <div className="dashboard-page__grid">
          <div className="dashboard-page__grid-item">
            <h2 className="dashboard-page__section-title">Upcoming Matches</h2>
            {upcomingMatches.length > 0 ? (
              <div className="dashboard-page__matches">
                {upcomingMatches.map(match => (
                  <LiveScoreCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="dashboard-page__no-matches">
                <p>No upcoming matches in the next 3 days.</p>
              </div>
            )}
          </div>
          
          <div className="dashboard-page__grid-item">
            <h2 className="dashboard-page__section-title">Recent Results</h2>
            {recentMatches.length > 0 ? (
              <div className="dashboard-page__matches">
                {recentMatches.map(match => (
                  <LiveScoreCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="dashboard-page__no-matches">
                <p>No matches in the last 3 days.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <section className="dashboard-page__section">
        <h2 className="dashboard-page__section-title">Points Table</h2>
        <PointsTable teams={teams} />
      </section>
      
      <section className="dashboard-page__section">
        <h2 className="dashboard-page__section-title">Top Performers</h2>
        <TopPerformers topBatsmen={topBatsmen} topBowlers={topBowlers} />
      </section>
    </div>
  );
};

export default DashboardPage;