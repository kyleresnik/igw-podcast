import React, { useState } from 'react';
import { useRSSFeed } from '../hooks/useRSSFeed';
import EpisodeList from '../components/archive/EpisodeList';
import Loading from '../components/common/Loading';

// archive page component displaying all episodes with server-side pagination
const Archive: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 10;

  // calculate offset for current page
  const offset = (currentPage - 1) * episodesPerPage;

  const { episodes, podcast, loading, error, refetch } = useRSSFeed(
    episodesPerPage,
    offset
  );

  if (loading) {
    return <Loading message="Loading episode archive..." />;
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <h2>Unable to Load Archive</h2>
        <p>
          We're having trouble loading the episode archive. Please try again
          later.
        </p>
        <details
          style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}
        >
          <summary>Error Details</summary>
          <p>{error}</p>
        </details>
        <button
          onClick={refetch}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentEpisodes = episodes || [];

  // TODO: figure out how to paginate better
  // for proper pagination, you'd need the total count from your server
  // for now, we'll show pagination controls and let the server handle the limits
  const hasNextPage = currentEpisodes.length === episodesPerPage;
  const hasPrevPage = currentPage > 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="archive-page">
      <div className="page-header">
        <h1>Episode Archive</h1>
        <p className="page-subtitle">
          Browse through all episodes of It Gets Weird
          {podcast?.title && ` - ${podcast.title}`}
        </p>
      </div>

      <div className="archive-content">
        <EpisodeList episodes={currentEpisodes} />

        {(hasNextPage || hasPrevPage) && (
          <nav className="pagination" aria-label="Episode archive pagination">
            <ul className="pagination-list">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                  aria-label="Previous page"
                  className="pagination-button"
                >
                  Previous
                </button>
              </li>

              <li>
                <span className="pagination-info">Page {currentPage}</span>
              </li>

              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  aria-label="Next page"
                  className="pagination-button"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}

        {currentEpisodes.length === 0 && (
          <div className="no-episodes">
            <h3>No episodes found</h3>
            <p>There are no episodes to display at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
