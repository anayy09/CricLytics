import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';

// Placeholder components (we'll create these later)
const Dashboard = () => <div>Dashboard</div>;
const Players = () => <div>Players</div>;
const Teams = () => <div>Teams</div>;
const Predictions = () => <div>Predictions</div>;

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>IPL 2025 Analytics</h1>
          <nav>
            <ul>
              <li><a href="/">Live</a></li>
              <li><a href="/players">Players</a></li>
              <li><a href="/teams">Teams</a></li>
              <li><a href="/predictions">Predictions</a></li>
            </ul>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
        
        <footer>
          <p>© 2025 IPL Analytics Platform</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;