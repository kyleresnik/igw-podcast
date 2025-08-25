import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// navigation header component + menu
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/archive', label: 'Archive' },
    { path: '/blog', label: 'Blog' },
    { path: '/merch', label: 'Merch' },
    { path: '/contact', label: 'Contact' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <Link to="/" className="logo" aria-label="Home">
          <h1>It Gets Weird</h1>
        </Link>

        <nav
          className="navigation"
          role="navigation"
          aria-label="Main navigation"
        >
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="navigation-menu"
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul
            id="navigation-menu"
            className={`nav-menu ${isMenuOpen ? 'active' : ''}`}
          >
            {navigationItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://www.twitch.tv/itgetsweird"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link outgoing-link"
                aria-label="Follow us on Twitch.tv (opens in new tab)"
              >
                Twitch
              </a>
            </li>
            <li>
              <a
                href="https://patreon.com/itgetsweird"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link outgoing-link"
                aria-label="Support us on Patreon (opens in new tab)"
              >
                Patreon
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
