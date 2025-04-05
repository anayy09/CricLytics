import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__section">
          <h3>IPL 2025 Analytics</h3>
          <p>Your comprehensive cricket analytics platform for the Indian Premier League 2025.</p>
        </div>
        <div className="footer__section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Live Dashboard</a></li>
            <li><a href="/teams">Teams</a></li>
            <li><a href="/players">Players</a></li>
            <li><a href="/matches">Matches</a></li>
            <li><a href="/predictions">Predictions</a></li>
          </ul>
        </div>
        <div className="footer__section">
          <h3>Connect</h3>
          <ul className="footer__social">
            <li><a href="#" aria-label="Twitter">Twitter</a></li>
            <li><a href="#" aria-label="Facebook">Facebook</a></li>
            <li><a href="#" aria-label="Instagram">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} IPL 2025 Analytics. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;