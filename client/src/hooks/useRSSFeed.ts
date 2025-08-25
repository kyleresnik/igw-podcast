import { useState, useEffect, useCallback } from 'react';
import { Episode, PodcastInfo, ApiResponse } from '../types/podcast';

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
 * @param offset - optional offset for pagination
 * @returns rss feed data and loading state
 */
export const useRSSFeed = (
  limit?: number,
  offset?: number
): UseRSSFeedReturn => {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRSSData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      // build episodes endpoint with query parameters
      const episodesParams = new URLSearchParams();
      if (limit !== undefined) episodesParams.append('limit', limit.toString());
      if (offset !== undefined)
        episodesParams.append('offset', offset.toString());

      const episodesUrl = `${apiUrl}/api/rss/episodes${
        episodesParams.toString() ? `?${episodesParams.toString()}` : ''
      }`;
      const podcastInfoUrl = `${apiUrl}/api/rss/podcast-info`;

      console.log('Fetching episodes from:', episodesUrl);
      console.log('Fetching podcast info from:', podcastInfoUrl);

      // fetch both endpoints concurrently
      const [episodesResponse, podcastInfoResponse] = await Promise.all([
        fetch(episodesUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }),
        fetch(podcastInfoUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }),
      ]);

      // check if responses are ok
      if (!episodesResponse.ok) {
        throw new Error(
          `Episodes API error! Status: ${episodesResponse.status} - ${episodesResponse.statusText}`
        );
      }

      if (!podcastInfoResponse.ok) {
        throw new Error(
          `Podcast info API error! Status: ${podcastInfoResponse.status} - ${podcastInfoResponse.statusText}`
        );
      }

      // parse json responses
      const episodesData: ApiResponse<Episode[]> =
        await episodesResponse.json();
      const podcastInfoData: ApiResponse<PodcastInfo> =
        await podcastInfoResponse.json();

      console.log('Episodes response:', episodesData);
      console.log('Podcast info response:', podcastInfoData);

      // check if both requests were successful
      if (!episodesData.success) {
        throw new Error(
          episodesData.error ||
            'Failed to fetch episodes - server returned error'
        );
      }

      if (!podcastInfoData.success) {
        throw new Error(
          podcastInfoData.error ||
            'Failed to fetch podcast info - server returned error'
        );
      }

      // process episodes data
      if (episodesData.data && Array.isArray(episodesData.data)) {
        const processedEpisodes: Episode[] = episodesData.data.map(
          (episode: any) => ({
            ...episode,
            publishDate: new Date(episode.publishDate), // Ensure dates are Date objects
          })
        );
        setEpisodes(processedEpisodes);
      } else {
        throw new Error(
          'Episodes data is not in expected format (should be array)'
        );
      }

      // set podcast info
      if (podcastInfoData.data) {
        const processedPodcast: PodcastInfo = {
          ...podcastInfoData.data,
          lastBuildDate: podcastInfoData.data.lastBuildDate
            ? new Date(podcastInfoData.data.lastBuildDate)
            : undefined,
          pubDate: podcastInfoData.data.pubDate
            ? new Date(podcastInfoData.data.pubDate)
            : undefined,
        };
        setPodcast(processedPodcast);
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred while fetching RSS data';

      if (err instanceof TypeError && err.message.includes('fetch')) {
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
  }, [limit, offset]); // dependencies for useCallback

  const refetch = () => {
    fetchRSSData();
  };

  useEffect(() => {
    fetchRSSData();
  }, [fetchRSSData]); // fetchRSSData is memoized and safe to include

  return {
    episodes,
    podcast,
    loading,
    error,
    refetch,
  };
};
