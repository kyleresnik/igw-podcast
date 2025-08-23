import React from 'react';
import { Episode } from '../../types/podcast';

interface EpisodeCardProps {
  episode: Episode;
}

// episode card component for grid layout
const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  // TODO: add date and html formatting to utils! DRY this stuff
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // TODO: add date and html formatting to utils! DRY this stuff
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <article
      className="episode-card"
      aria-labelledby={`card-${episode.id}-title`}
    >
      {episode.imageUrl && (
        <div className="card-image">
          <img
            src={episode.imageUrl}
            alt={`Cover for ${episode.title}`}
            loading="lazy"
          />
        </div>
      )}

      <div className="card-content">
        <h3 id={`card-${episode.id}-title`} className="card-title">
          {episode.title}
        </h3>

        <div className="card-meta">
          <time dateTime={episode.publishDate.toISOString()}>
            {formatDate(episode.publishDate)}
          </time>
          {episode.duration && (
            <span className="duration">🕐 {episode.duration}</span>
          )}
        </div>

        <p className="card-description">
          {stripHtml(episode.description).substring(0, 100)}...
        </p>

        <div className="card-actions">
          <button
            className="play-button-small"
            aria-label={`Play ${episode.title}`}
            onClick={() => window.open(episode.audioUrl, '_blank')}
          >
            ▶️ Play
          </button>
        </div>
      </div>
    </article>
  );
};

export default EpisodeCard;
