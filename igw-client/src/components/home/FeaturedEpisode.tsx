import React from 'react';
import { Episode } from '../../types/podcast';

interface FeaturedEpisodeProps {
  episode: Episode;
}

// featured episode content for homepage display
const FeaturedEpisode: React.FC<FeaturedEpisodeProps> = ({ episode }) => {
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

  return (
    <article
      className="featured-episode"
      aria-labelledby={`episode-${episode.id}-title`}
    >
      <div className="featured-content">
        <div className="featured-info">
          <h3 id={`episode-${episode.id}-title`}>{episode.title}</h3>

          <div className="episode-meta">
            <time dateTime={episode.publishDate.toISOString()}>
              {formatDate(episode.publishDate)}
            </time>
            {episode.duration && (
              <span
                className="duration"
                aria-label={`Duration: ${episode.duration}`}
              >
                🕐 {episode.duration}
              </span>
            )}
            {episode.episodeNumber && (
              <span className="episode-number">
                Episode {episode.episodeNumber}
              </span>
            )}
          </div>

          <div className="episode-description">
            <p>{stripHtml(episode.description).substring(0, 200)}...</p>
          </div>

          <div className="episode-actions">
            <button
              className="play-button"
              aria-label={`Play ${episode.title}`}
              onClick={() => {
                // TODO: Implement audio player
                window.open(episode.audioUrl, '_blank');
              }}
            >
              ▶️ Play Episode
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
              ⬇️ Download
            </button>
          </div>
        </div>

        {episode.imageUrl && (
          <div className="featured-image">
            <img
              src={episode.imageUrl}
              alt={`Cover art for ${episode.title}`}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default FeaturedEpisode;
