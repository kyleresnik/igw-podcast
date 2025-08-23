import React from 'react';
import { useRSSFeed } from '../hooks/useRSSFeed';
import EpisodeCard from '../components/home/EpisodeCard';
import FeaturedEpisode from '../components/home/FeaturedEpisode';
import Loading from '../components/common/Loading';

const Home: React.FC = () => {
  // load 5 most recent episodes
  const { episodes, podcast, loading, error } = useRSSFeed(5);

  if (loading) {
    return <Loading message="Loading latest episodes..." />;
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <h2>Unable to Load Episodes</h2>
        <p>
          We're having trouble fetching the latest episodes. Please try again
          later.
        </p>
        <details
          style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}
        >
          <summary>Error Details</summary>
          <p>{error}</p>
        </details>
      </div>
    );
  }

  const [featuredEpisode, ...otherEpisodes] = episodes || [];

  return (
    <div className="home-page">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">Welcome to It Gets Weird</h1>
          <p className="hero-description">
            Longtime friends Nile and Kyle are the leading conspiracy,
            cryptozoology, and paranormal experts in their fields. Well, at
            least in their apartment. Join them and a revolving door of friends
            every Sunday for a deep dive into the curious, the unexplained, and
            the outright weird.
          </p>
        </div>
      </section>

      {featuredEpisode && (
        <section className="featured-section" aria-labelledby="featured-title">
          <h2 id="featured-title">Latest Episode</h2>
          <FeaturedEpisode episode={featuredEpisode} />
        </section>
      )}

      {otherEpisodes.length > 0 && (
        <section className="recent-episodes" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent Episodes</h2>
          <div className="episodes-grid">
            {otherEpisodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        </section>
      )}

      <section className="call-to-action">
        <h2>Never Miss an Episode</h2>
        <p>
          Subscribe to stay updated on our latest investigations into the
          unknown.
        </p>
        <div className="subscribe-links">
          <a
            href="https://podcasts.apple.com/podcast/it-gets-weird/id1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-button"
            aria-label="Subscribe on Apple Podcasts (opens in new tab)"
          >
            Apple Podcasts
          </a>
          <a
            href="https://open.spotify.com/show/itgetsweird"
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-button"
            aria-label="Subscribe on Spotify (opens in new tab)"
          >
            Spotify
          </a>
          <a
            href="https://feeds.libsyn.com/84842/rss"
            className="subscribe-button"
            aria-label="RSS Feed"
            target="_blank"
            rel="noopener noreferrer"
          >
            RSS Feed
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
