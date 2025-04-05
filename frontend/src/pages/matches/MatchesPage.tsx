import React, { useState, useEffect } from 'react';
import { matchesApi, teamsApi } from '../../services/api';
import { Match, Team } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import MatchCard from '../../components/matches/MatchCard';
import './MatchesPage.scss';

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch teams for filter
        const teamsResponse = await teamsApi.getAll();
        setTeams(teamsResponse.data);
        
        // Fetch matches with filters
        const params: any = {
          limit: 100,
        };
        
        if (selectedStatus !== 'all') {
          params.status = selectedStatus;
        }
        
        if (selectedTeam) {
          params.team_id = selectedTeam;
        }
        
        if (fromDate) {
          params.from_date = fromDate;
        }
        
        if (toDate) {
          params.to_date = toDate;
        }
        
        const matchesResponse = await matchesApi.getAll(params);
        setMatches(matchesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load matches. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedStatus, selectedTeam, fromDate, toDate]);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };
  
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedTeam(teamId);
  };
  
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };
  
  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
  };
  
  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedTeam(null);
    setFromDate('');
    setToDate('');
  };
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading matches..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  return (
    <div className="matches-page">
      <h1 className="matches-page__title">IPL 2025 Matches</h1>
      
      <div className="matches-page__filters">
        <div className="matches-page__filter">
          <label htmlFor="status" className="matches-page__filter-label">Status</label>
          <select 
            id="status"
            value={selectedStatus} 
            onChange={handleStatusChange} 
            className="matches-page__select"
          >
            <option value="all">All Matches</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Upcoming</option>
          </select>
        </div>
        
        <div className="matches-page__filter">
          <label htmlFor="team" className="matches-page__filter-label">Team</label>
          <select 
            id="team"
            value={selectedTeam?.toString() || ''} 
            onChange={handleTeamChange} 
            className="matches-page__select"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id.toString()}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="matches-page__filter">
          <label htmlFor="fromDate" className="matches-page__filter-label">From Date</label>
          <input 
            id="fromDate"
            type="date" 
            value={fromDate} 
            onChange={handleFromDateChange} 
            className="matches-page__input"
          />
        </div>
        
        <div className="matches-page__filter">
          <label htmlFor="toDate" className="matches-page__filter-label">To Date</label>
          <input 
            id="toDate"
            type="date" 
            value={toDate} 
            onChange={handleToDateChange} 
            className="matches-page__input"
          />
        </div>
        
        <button onClick={clearFilters} className="matches-page__clear-btn">
          Clear Filters
        </button>
      </div>
      
      <div className="matches-page__count">
        Showing {matches.length} matches
      </div>
      
      <div className="matches-page__grid">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
      
      {matches.length === 0 && (
        <div className="matches-page__no-results">
          <p>No matches found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;