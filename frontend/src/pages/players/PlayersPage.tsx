import React, { useState, useEffect } from 'react';
import { playersApi, teamsApi } from '../../services/api';
import { Player, Team } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import PlayerCard from '../../components/players/PlayerCard';
import './PlayersPage.scss';

const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch teams for filter
        const teamsResponse = await teamsApi.getAll();
        setTeams(teamsResponse.data);
        
        // Fetch players
        const playersResponse = await playersApi.getAll({
          limit: 100,
          role: selectedRole || undefined,
          team_id: selectedTeam || undefined
        });
        setPlayers(playersResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to load players. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedRole, selectedTeam]);
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };
  
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedTeam(teamId);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading players..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  return (
    <div className="players-page">
      <h1 className="players-page__title">IPL 2025 Players</h1>
      
      <div className="players-page__filters">
        <div className="players-page__filter">
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="players-page__search"
          />
        </div>
        
        <div className="players-page__filter">
          <select value={selectedRole} onChange={handleRoleChange} className="players-page__select">
            <option value="">All Roles</option>
            <option value="Batsman">Batsmen</option>
            <option value="Bowler">Bowlers</option>
            <option value="All-rounder">All-rounders</option>
            <option value="Wicket-keeper">Wicket-keepers</option>
          </select>
        </div>
        
        <div className="players-page__filter">
          <select value={selectedTeam?.toString() || ''} onChange={handleTeamChange} className="players-page__select">
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id.toString()}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="players-page__count">
        Showing {filteredPlayers.length} players
      </div>
      
      <div className="players-page__grid">
        {filteredPlayers.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
      
      {filteredPlayers.length === 0 && (
        <div className="players-page__no-results">
          <p>No players found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PlayersPage;