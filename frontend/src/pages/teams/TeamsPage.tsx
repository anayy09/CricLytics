import React, { useState, useEffect } from 'react';
import { teamsApi } from '../../services/api';
import { Team } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import TeamCard from '../../components/teams/TeamCard';
import './TeamsPage.scss';

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await teamsApi.getAll();
        setTeams(response.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, []);
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading teams..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  return (
    <div className="teams-page">
      <h1 className="teams-page__title">IPL 2025 Teams</h1>
      
      <div className="teams-page__grid">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
};

export default TeamsPage;