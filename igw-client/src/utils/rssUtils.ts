import { Episode, PodcastInfo } from '../types/podcast';

/**
 * utility functions for handling rss feed data from server responses
 * server should handle xml parsing and return clean json
 */

// validate episode data structure
export const validateEpisode = (episode: any): episode is Episode => {
  return (
    episode &&
    typeof episode.id === 'string' &&
    typeof episode.title === 'string' &&
    typeof episode.description === 'string' &&
    typeof episode.audioUrl === 'string' &&
    episode.publishDate
  );
};

// validate podcast info data structure
export const validatePodcastInfo = (podcast: any): podcast is PodcastInfo => {
  return (
    podcast &&
    typeof podcast.title === 'string' &&
    typeof podcast.description === 'string'
  );
};

// process episode data to ensure proper types
export const processEpisode = (episode: any): Episode => {
  if (!validateEpisode(episode)) {
    throw new Error('Invalid episode data structure');
  }

  return {
    ...episode,
    publishDate: new Date(episode.publishDate),
    episodeNumber: episode.episodeNumber
      ? parseInt(String(episode.episodeNumber), 10)
      : undefined,
    season: episode.season ? parseInt(String(episode.season), 10) : undefined,
  };
};

// process podcast info data for type validation
export const processPodcastInfo = (podcast: any): PodcastInfo => {
  if (!validatePodcastInfo(podcast)) {
    throw new Error('Invalid podcast info data structure');
  }

  return {
    ...podcast,
    lastBuildDate: podcast.lastBuildDate
      ? new Date(podcast.lastBuildDate)
      : undefined,
    pubDate: podcast.pubDate ? new Date(podcast.pubDate) : undefined,
  };
};

// error handling for api responses
export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}
