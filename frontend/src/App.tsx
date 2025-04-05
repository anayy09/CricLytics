import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import DashboardPage from './pages/dashboard/DashboardPage';
import TeamsPage from './pages/teams/TeamsPage';
import TeamDetailPage from './pages/teams/TeamDetailPage';
import PlayersPage from './pages/players/PlayersPage';
import PlayerDetailPage from './pages/players/PlayerDetailPage';
import MatchesPage from './pages/matches/MatchesPage';
import MatchDetailPage from './pages/matches/MatchDetailPage';
import PredictionsPage from './pages/predictions/PredictionsPage';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main className="app__main">
          <div className="container">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:id" element={<PlayerDetailPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:id" element={<MatchDetailPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
            </Routes>
          </div>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;