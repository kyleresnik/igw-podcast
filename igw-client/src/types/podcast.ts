// represents a single podcast episode
export interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  publishDate: Date;
  duration?: string;
  episodeNumber?: number;
  season?: number;
  imageUrl?: string;
  keywords?: string[];
  explicit?: boolean;
  episodeType?: string;
  author?: string;
}

// represents podcast metadata
export interface PodcastInfo {
  title: string;
  description: string;
  imageUrl?: string;
  author?: string;
  categories?: string[];
  language?: string;
  lastBuildDate?: Date;
  pubDate?: Date;
  link?: string;
  managingEditor?: string;
  explicit?: boolean;
}

// rss feed response structure
export interface RSSResponse {
  podcast: PodcastInfo;
  episodes: Episode[];
}

// api response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
