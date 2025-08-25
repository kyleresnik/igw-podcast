import React from 'react';
import { Episode } from '../../types/podcast';
import { DateUtils, TextUtils } from '../../utils/helpers';

interface EpisodeCardProps {
  episode: Episode;
}

// episode card component for grid layout
const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const handlePlayClick = () => {
    if (episode.audioUrl) {
      window.open(episode.audioUrl, '_blank');
    }
  };

  // const handleDownloadClick = () => {
  //   if (episode.audioUrl) {
  //     const filename = `${episode.title}.mp3`;
  //     MediaUtils.downloadFile(episode.audioUrl, filename);
  //   }
  // };

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
            {DateUtils.formatCardDate(episode.publishDate)}
          </time>
          {episode.duration && (
            <span className="duration">
              🕐 {TextUtils.formatDuration(episode.duration)}
            </span>
          )}
          {episode.episodeNumber && (
            <span className="episode-number">#{episode.episodeNumber}</span>
          )}
        </div>

        <p className="card-description">
          {TextUtils.cleanAndTruncate(episode.description, 100)}...
        </p>

        <div className="card-actions">
          <button
            className="play-button-small"
            aria-label={`Play ${episode.title}`}
            onClick={handlePlayClick}
            disabled={!episode.audioUrl}
          >
            ▶️ Play
          </button>
        </div>
      </div>
    </article>
  );
};

export default EpisodeCard;
