import React from 'react';

// site footer with social links
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>It Gets Weird</h3>
            <p>
              Longtime friends Nile and Kyle are the leading conspiracy,
              cryptozoology, and paranormal experts in their fields. Well, at
              least in their apartment.
            </p>
          </div>

          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a
                href="mailto:itgetsweirdpodcast@gmail.com"
                aria-label="Send us an email"
              >
                Email
              </a>
              <a
                href="http://itgetsweird.libsyn.com/podcast"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Libsyn page (opens in new tab)"
              >
                Libsyn
              </a>
              <a
                href="https://feeds.libsyn.com/84842/rss"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RSS Feed (opens in new tab)"
              >
                RSS Feed
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} It Gets Weird. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
