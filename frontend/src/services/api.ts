import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teams API
export const teamsApi = {
  getAll: () => api.get('/teams'),
  getById: (id: number) => api.get(`/teams/${id}`),
  getMatches: (id: number) => api.get(`/teams/${id}/matches`),
  getStats: (id: number) => api.get(`/teams/${id}/stats`),
  getHeadToHead: (team1Id: number, team2Id: number) => api.get(`/teams/head-to-head/${team1Id}/${team2Id}`),
};

// Players API
export const playersApi = {
  getAll: (params?: { skip?: number; limit?: number; role?: string; team_id?: number }) => 
    api.get('/players', { params }),
  getTopBatsmen: (limit?: number) => api.get('/players/top-batsmen', { params: { limit } }),
  getTopBowlers: (limit?: number) => api.get('/players/top-bowlers', { params: { limit } }),
  getById: (id: number) => api.get(`/players/${id}`),
  getMatches: (id: number) => api.get(`/players/${id}/matches`),
  getStats: (id: number) => api.get(`/players/${id}/stats`),
};

// Matches API
export const matchesApi = {
  getAll: (params?: { 
    skip?: number; 
    limit?: number; 
    status?: string; 
    team_id?: number;
    from_date?: string;
    to_date?: string;
  }) => api.get('/matches', { params }),
  getLive: () => api.get('/matches/live'),
  getUpcoming: (days?: number) => api.get('/matches/upcoming', { params: { days } }),
  getRecent: (days?: number) => api.get('/matches/recent', { params: { days } }),
  getById: (id: number) => api.get(`/matches/${id}`),
  getCommentary: (id: number) => api.get(`/matches/${id}/commentary`),
  getWinProbability: (id: number) => api.get(`/matches/${id}/win-probability`),
};

// Predictions API
export const predictionsApi = {
  getMatchPrediction: (matchId: number) => api.get(`/predictions/match/${matchId}`),
  getPlayoffChances: () => api.get('/predictions/playoffs'),
  simulateSeason: (simulations?: number) => api.get('/predictions/simulate-season', { params: { simulations } }),
  getPlayerPerformance: (playerId: number, matchId?: number) => 
    api.get(`/predictions/player-performance/${playerId}`, { params: { match_id: matchId } }),
};

export default api;