import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import DashboardPage from './components/dashboard/DashboardPage';
import './App.scss';

// Placeholder components (we'll create these in future parts)
const TeamsPage = () => <div>Teams Page</div>;
const TeamDetailPage = () => <div>Team Detail Page</div>;
const PlayersPage = () => <div>Players Page</div>;
const PlayerDetailPage = () => <div>Player Detail Page</div>;
const MatchesPage = () => <div>Matches Page</div>;
const MatchDetailPage = () => <div>Match Detail Page</div>;
const PredictionsPage = () => <div>Predictions Page</div>;

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