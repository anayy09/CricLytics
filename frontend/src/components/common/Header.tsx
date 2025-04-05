import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <header className="header">
      <div className="header__logo">
        <Link to="/">
          <h1>IPL 2025</h1>
        </Link>
      </div>
      <nav className="header__nav">
        <ul>
          <li className={isActive('/')}>
            <Link to="/">Live</Link>
          </li>
          <li className={isActive('/teams')}>
            <Link to="/teams">Teams</Link>
          </li>
          <li className={isActive('/players')}>
            <Link to="/players">Players</Link>
          </li>
          <li className={isActive('/matches')}>
            <Link to="/matches">Matches</Link>
          </li>
          <li className={isActive('/predictions')}>
            <Link to="/predictions">Predictions</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;