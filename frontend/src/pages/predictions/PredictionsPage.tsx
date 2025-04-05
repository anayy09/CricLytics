import React, { useState, useEffect } from 'react';
import { matchesApi, predictionsApi } from '../../services/api';
import { Match, PlayoffPrediction, SeasonSimulation, MatchPrediction } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Card from '../../components/common/Card';
import PlayoffChances from '../../components/predictions/PlayoffChances';
import SeasonSimulator from '../../components/predictions/SeasonSimulator';
import MatchPredictionCard from '../../components/predictions/MatchPredictionCard';
import './PredictionsPage.scss';

const PredictionsPage: React.FC = () => {
  const [playoffPrediction, setPlayoffPrediction] = useState<PlayoffPrediction | null>(null);
  const [seasonSimulation, setSeasonSimulation] = useState<SeasonSimulation | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [matchPredictions, setMatchPredictions] = useState<{ [key: number]: MatchPrediction }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationLoading, setSimulationLoading] = useState<boolean>(false);
  const [simulationCount, setSimulationCount] = useState<number>(1000);
  
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch playoff chances
        const playoffResponse = await predictionsApi.getPlayoffChances();
        setPlayoffPrediction(playoffResponse.data);
        
        // Fetch season simulation
        const simulationResponse = await predictionsApi.simulateSeason(simulationCount);
        setSeasonSimulation(simulationResponse.data);
        
        // Fetch upcoming matches
        const matchesResponse = await matchesApi.getUpcoming(7); // Next 7 days
        setUpcomingMatches(matchesResponse.data);
        
        // Fetch match predictions for upcoming matches
        const predictions: { [key: number]: MatchPrediction } = {};
        for (const match of matchesResponse.data) {
          const predictionResponse = await predictionsApi.getMatchPrediction(match.id);
          predictions[match.id] = predictionResponse.data;
        }
        setMatchPredictions(predictions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Failed to load predictions. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPredictions();
  }, []);
  
  const handleSimulationCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSimulationCount(parseInt(e.target.value));
  };
  
  const runSimulation = async () => {
    try {
      setSimulationLoading(true);
      
      const simulationResponse = await predictionsApi.simulateSeason(simulationCount);
      setSeasonSimulation(simulationResponse.data);
      
      setSimulationLoading(false);
    } catch (err) {
      console.error('Error running simulation:', err);
      setSimulationLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner size="large" message="Loading predictions..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  return (
    <div className="predictions-page">
      <h1 className="predictions-page__title">IPL 2025 Predictions</h1>
      
      <div className="predictions-page__section">
        <h2 className="predictions-page__section-title">Playoff Race</h2>
        {playoffPrediction && <PlayoffChances prediction={playoffPrediction} />}
      </div>
      
      <div className="predictions-page__section">
        <h2 className="predictions-page__section-title">Season Simulator</h2>
        <Card className="predictions-page__simulator-controls">
          <div className="predictions-page__simulator-info">
            <p>
              Run simulations of the remaining IPL 2025 season to predict playoff chances and the eventual champion.
              More simulations provide more accurate results but take longer to process.
            </p>
          </div>
          
          <div className="predictions-page__simulator-actions">
            <div className="predictions-page__simulator-select">
              <label htmlFor="simulation-count">Number of Simulations:</label>
              <select 
                id="simulation-count"
                value={simulationCount} 
                onChange={handleSimulationCountChange}
                disabled={simulationLoading}
              >
                <option value="100">100 (Fast)</option>
                <option value="1000">1,000 (Standard)</option>
                <option value="10000">10,000 (Accurate)</option>
              </select>
            </div>
            
            <button 
              className="predictions-page__simulator-button" 
              onClick={runSimulation}
              disabled={simulationLoading}
            >
              {simulationLoading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </Card>
        
        {seasonSimulation && <SeasonSimulator simulation={seasonSimulation} />}
      </div>
      
      <div className="predictions-page__section">
        <h2 className="predictions-page__section-title">Upcoming Match Predictions</h2>
        
        {upcomingMatches.length > 0 ? (
          <div className="predictions-page__match-predictions">
            {upcomingMatches.map(match => (
              matchPredictions[match.id] && (
                <div key={match.id} className="predictions-page__match-prediction">
                  <MatchPredictionCard prediction={matchPredictions[match.id]} />
                </div>
              )
            ))}
          </div>
        ) : (
          <Card className="predictions-page__no-matches">
            <p>No upcoming matches scheduled.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;