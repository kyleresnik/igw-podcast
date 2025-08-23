import React from 'react';
import { useRSSFeed } from '../hooks/useRSSFeed';
import EpisodeCard from '../components/home/EpisodeCard';
import FeaturedEpisode from '../components/home/FeaturedEpisode';
import Loading from '../components/common/Loading';

const Home: React.FC = () => {
  // Load 5 most recent episodes
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
      </div>
    );
  }

  const [featuredEpisode, ...otherEpisodes] = episodes || [];

  return (
    <div className="home-page">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">Welcome to Weird Tales</h1>
          <p className="hero-description">
            Your gateway to the mysterious, unexplained, and downright bizarre.
            Join us as we dive deep into conspiracies, cryptozoology, UFO
            sightings, and paranormal phenomena that challenge everything we
            think we know.
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
            href="https://podcasts.apple.com/yourpodcast"
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-button"
            aria-label="Subscribe on Apple Podcasts (opens in new tab)"
          >
            Apple Podcasts
          </a>
          <a
            href="https://open.spotify.com/yourpodcast"
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-button"
            aria-label="Subscribe on Spotify (opens in new tab)"
          >
            Spotify
          </a>
          <a href="/rss" className="subscribe-button" aria-label="RSS Feed">
            RSS Feed
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
