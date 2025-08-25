import React from 'react';
import { Episode } from '../../types/podcast';
import { DateUtils, TextUtils, MediaUtils } from '../../utils/helpers';

interface FeaturedEpisodeProps {
  episode: Episode;
}

// featured episode content for homepage display
const FeaturedEpisode: React.FC<FeaturedEpisodeProps> = ({ episode }) => {
  const handlePlayClick = () => {
    if (episode.audioUrl) {
      // TODO: implement audio player
      window.open(episode.audioUrl, '_blank');
    }
  };

  const handleDownloadClick = () => {
    if (episode.audioUrl) {
      const filename = `${episode.title}.mp3`;
      MediaUtils.downloadFile(episode.audioUrl, filename);
    }
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
              {DateUtils.formatListDate(episode.publishDate)}
            </time>
            {episode.duration && (
              <span
                className="duration"
                aria-label={`Duration: ${TextUtils.formatDuration(
                  episode.duration
                )}`}
              >
                🕐 {TextUtils.formatDuration(episode.duration)}
              </span>
            )}
            {episode.episodeNumber && (
              <span className="episode-number">
                Episode {episode.episodeNumber}
              </span>
            )}
            {episode.season && (
              <span className="season-number">Season {episode.season}</span>
            )}
          </div>

          <div className="episode-description">
            <p>{TextUtils.cleanAndTruncate(episode.description, 250)}...</p>
          </div>

          <div className="episode-actions">
            <button
              className="play-button"
              aria-label={`Play ${episode.title}`}
              onClick={handlePlayClick}
              disabled={!episode.audioUrl}
            >
              ▶️ Play Episode
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
