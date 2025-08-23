import { useState, useEffect } from 'react';
import {
  Episode,
  PodcastInfo,
  ApiResponse,
  RSSResponse,
} from '../types/podcast';
import { RSSParser, RSSParsingError } from '../utils/rssParser';

// rss feed hook return type
interface UseRSSFeedReturn {
  episodes: Episode[] | null;
  podcast: PodcastInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * custom hook for fetching and managing rss feed data
 * @param limit - optional limit for number of episodes to fetch
 * @returns rss feed data and loading state
 */
export const useRSSFeed = (limit?: number): UseRSSFeedReturn => {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRSSData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams();

      if (limit) {
        params.append('limit', limit.toString());
      }

      const url = `${apiUrl}/api/rss${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      console.log('Fetching RSS data from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} - ${response.statusText}`
        );
      }

      const data: ApiResponse<any> = await response.json();
      console.log('Server response:', data);

      if (data.success && data.data) {
        // parse the rss data using our parser
        const parsedData: RSSResponse = RSSParser.parseServerResponse(
          data.data
        );

        // apply limit if specified and not already applied by server
        const finalEpisodes =
          limit && parsedData.episodes.length > limit
            ? parsedData.episodes.slice(0, limit)
            : parsedData.episodes;

        setEpisodes(finalEpisodes);
        setPodcast(parsedData.podcast);
      } else {
        throw new Error(
          data.error || 'Failed to fetch RSS data - invalid response format'
        );
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred while fetching RSS data';

      if (err instanceof RSSParsingError) {
        errorMessage = `RSS parsing error: ${err.message}`;
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage =
          'Network error: Unable to connect to the server. Make sure the server is running on localhost:5000';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('RSS Feed Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchRSSData();
  };

  useEffect(() => {
    fetchRSSData();
  }, [limit]);

  return {
    episodes,
    podcast,
    loading,
    error,
    refetch,
  };
};
