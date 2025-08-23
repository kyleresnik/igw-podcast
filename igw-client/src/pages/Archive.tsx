import React, { useState } from 'react';
import { useRSSFeed } from '../hooks/useRSSFeed';
import EpisodeList from '../components/archive/EpisodeList';
import Loading from '../components/common/Loading';

/**
 * Archive page component displaying all episodes with pagination
 */
const Archive: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 10;

  const { episodes, loading, error } = useRSSFeed();

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
      </div>
    );
  }

  const totalPages = Math.ceil((episodes?.length || 0) / episodesPerPage);
  const startIndex = (currentPage - 1) * episodesPerPage;
  const currentEpisodes =
    episodes?.slice(startIndex, startIndex + episodesPerPage) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="archive-page">
      <div className="page-header">
        <h1>Episode Archive</h1>
        <p className="page-subtitle">
          Browse through all {episodes?.length || 0} episodes of Weird Tales
        </p>
      </div>

      <div className="archive-content">
        <EpisodeList episodes={currentEpisodes} />

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Episode archive pagination">
            <ul className="pagination-list">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="pagination-button"
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <li key={page}>
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`pagination-button ${
                        currentPage === page ? 'active' : ''
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </li>
                );
              })}

              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="pagination-button"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Archive;
