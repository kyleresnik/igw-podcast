import React from 'react';
import { Episode } from '../../types/podcast';

interface EpisodeListProps {
  episodes: Episode[];
}

/**
 * List view component for archive page
 */
const EpisodeList: React.FC<EpisodeListProps> = ({ episodes }) => {
  // TODO: add date and html formatting to utils! DRY this stuff
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // TODO: add date and html formatting to utils! DRY this stuff
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="no-episodes">
        <p>No episodes available at this time.</p>
      </div>
    );
  }

  return (
    <div className="episode-list">
      {episodes.map((episode) => (
        <article
          key={episode.id}
          className="episode-list-item"
          aria-labelledby={`list-${episode.id}-title`}
        >
          <div className="list-item-content">
            <div className="list-item-main">
              <h3 id={`list-${episode.id}-title`} className="list-item-title">
                {episode.title}
              </h3>

              <div className="list-item-meta">
                <time dateTime={episode.publishDate.toISOString()}>
                  {formatDate(episode.publishDate)}
                </time>
                {episode.duration && (
                  <span className="duration">Duration: {episode.duration}</span>
                )}
                {episode.episodeNumber && (
                  <span className="episode-number">
                    Episode {episode.episodeNumber}
                  </span>
                )}
              </div>

              <div className="list-item-description">
                <p>{stripHtml(episode.description).substring(0, 150)}...</p>
              </div>
            </div>

            <div className="list-item-actions">
              <button
                className="play-button"
                aria-label={`Play ${episode.title}`}
                onClick={() => window.open(episode.audioUrl, '_blank')}
              >
                ▶️ Play
              </button>
              <button
                className="download-button"
                aria-label={`Download ${episode.title}`}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = episode.audioUrl;
                  link.download = `${episode.title}.mp3`;
                  link.click();
                }}
              >
                ⬇️
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default EpisodeList;
