import { useState, useEffect } from 'react';
import { Episode, PodcastInfo } from '../types/podcast';

// rss feed hook return type
interface UseRSSFeedReturn {
  episodes: Episode[] | null;
  podcast: PodcastInfo | null;
  loading: boolean;
  error: string | null;
}

/**
 * custom hook for fetching and managing rss feed data
 * @param limit - limit for number of episodes to fetch
 * @returns rss feed data and loading state
 */
export const useRSSFeed = (limit?: number): UseRSSFeedReturn => {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSSData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.REACT_APP_API_URL;
        const params = limit ? `?limit=${limit}` : '';
        const response = await fetch(`${apiUrl}/api/rss/episodes${params}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setEpisodes(data.data.episodes);
          setPodcast(data.data.podcast);
        } else {
          throw new Error(data.error || 'Failed to fetch RSS data');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';

        setError(errorMessage);
        console.error('RSS Feed Error: ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRSSData();
  }, [limit]);

  return { episodes, podcast, loading, error };
};
