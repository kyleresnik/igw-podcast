import React from 'react';

// site footer with social links

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Weird Tales Podcast</h3>
            <p>Exploring the strange, mysterious, and unexplained.</p>
          </div>

          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a
                href="https://twitter.com/yourpodcast"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter (opens in new tab)"
              >
                Twitter
              </a>
              <a
                href="https://instagram.com/yourpodcast"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram (opens in new tab)"
              >
                Instagram
              </a>
              <a
                href="mailto:contact@yourpodcast.com"
                aria-label="Send us an email"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Weird Tales Podcast. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
