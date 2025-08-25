import React from 'react';
import { Episode } from '../../types/podcast';
import { DateUtils, TextUtils, MediaUtils } from '../../utils/helpers';

interface EpisodeListProps {
  episodes: Episode[];
}

// list view component for episode archive page
const EpisodeList: React.FC<EpisodeListProps> = ({ episodes }) => {
  const handlePlayClick = (episode: Episode) => {
    if (episode.audioUrl) {
      window.open(episode.audioUrl, '_blank');
    }
  };

  const handleDownloadClick = (episode: Episode) => {
    if (episode.audioUrl) {
      const filename = `${episode.title}.mp3`;
      MediaUtils.downloadFile(episode.audioUrl, filename);
    }
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
      {episodes.map(episode => (
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
                  {DateUtils.formatListDate(episode.publishDate)}
                </time>
                {episode.duration && (
                  <span className="duration">
                    Duration: {TextUtils.formatDuration(episode.duration)}
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

              <div className="list-item-description">
                <p>{TextUtils.cleanAndTruncate(episode.description, 200)}...</p>
              </div>
            </div>

            <div className="list-item-actions">
              <button
                className="play-button"
                aria-label={`Play ${episode.title}`}
                onClick={() => handlePlayClick(episode)}
                disabled={!episode.audioUrl}
              >
                ▶️ Play
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default EpisodeList;
