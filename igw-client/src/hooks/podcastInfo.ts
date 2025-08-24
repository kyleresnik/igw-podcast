import { useState, useEffect } from 'react';
import { PodcastInfo, ApiResponse } from '../types/podcast';

interface UsePodcastInfoReturn {
  podcast: PodcastInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * custom hook for fetching podcast information
 * @returns podcast info and loading state
 */
export const usePodcastInfo = (): UsePodcastInfoReturn => {
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPodcastInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const url = `${apiUrl}/api/rss/podcast-info`;

      console.log('Fetching podcast info from:', url);

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

      const data: ApiResponse<PodcastInfo> = await response.json();
      console.log('Podcast info response:', data);

      if (data.success && data.data) {
        const processedPodcast: PodcastInfo = {
          ...data.data,
          lastBuildDate: data.data.lastBuildDate
            ? new Date(data.data.lastBuildDate)
            : undefined,
          pubDate: data.data.pubDate ? new Date(data.data.pubDate) : undefined,
        };
        setPodcast(processedPodcast);
      } else {
        throw new Error(
          data.error || 'Failed to fetch podcast info - invalid response format'
        );
      }
    } catch (err) {
      let errorMessage =
        'An unknown error occurred while fetching podcast info';

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage =
          'Network error: Unable to connect to the server. Make sure the server is running on localhost:5000';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Podcast Info Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPodcastInfo();
  };

  useEffect(() => {
    fetchPodcastInfo();
  }, []);

  return {
    podcast,
    loading,
    error,
    refetch,
  };
};
