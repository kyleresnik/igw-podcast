import { useState, useEffect, useCallback } from 'react';
import { Episode, PodcastInfo } from '../types/podcast';

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
 * Enhanced for Netlify Functions with better error handling and debugging
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

  // get api url with environment detection
  const getApiUrl = useCallback(() => {
    // always use /.netlify/functions for netlify deployments
    return '/.netlify/functions';
  }, []);

  const fetchRSSData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();

      // build query parameters for episodes endpoint
      const episodesParams = new URLSearchParams();
      if (limit !== undefined) episodesParams.append('limit', limit.toString());
      if (offset !== undefined)
        episodesParams.append('offset', offset.toString());

      const episodesUrl = `${apiUrl}/episodes${
        episodesParams.toString() ? `?${episodesParams.toString()}` : ''
      }`;
      const podcastInfoUrl = `${apiUrl}/podcast-info`;

      console.log('[RSS Debug] Fetching from URLs:');
      console.log('Episodes URL:', episodesUrl);
      console.log('Podcast Info URL:', podcastInfoUrl);

      // fetch with timeout and debugging
      const fetchWithDebug = async (url: string, name: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          console.log(`[${name}] Starting fetch...`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log(`[${name}] Response status:`, response.status);
          console.log(
            `[${name}] Response headers:`,
            Object.fromEntries(response.headers.entries())
          );

          if (!response.ok) {
            // Try to get error details
            let errorText = '';
            try {
              errorText = await response.text();
              console.error(`[${name}] Error response body:`, errorText);
            } catch (e) {
              console.error(`[${name}] Could not read error response`);
            }
            throw new Error(
              `${name} failed with status ${response.status}: ${errorText.slice(0, 200)}`
            );
          }

          // Get the response text first to debug JSON parsing issues
          const responseText = await response.text();
          console.log(
            `[${name}] Raw response (first 500 chars):`,
            responseText.slice(0, 500)
          );

          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(responseText);
            console.log(`✅ [${name}] Successfully parsed JSON`);
            return jsonData;
          } catch (parseError) {
            console.error(`[${name}] JSON parse error:`, parseError);
            console.error(
              `[${name}] Response that failed to parse:`,
              responseText
            );
            throw new Error(
              `${name} returned invalid JSON. Got: ${responseText.slice(0, 100)}...`
            );
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      // fetch both endpoints with debugging
      const [episodesData, podcastInfoData] = await Promise.all([
        fetchWithDebug(episodesUrl, 'Episodes'),
        fetchWithDebug(podcastInfoUrl, 'Podcast Info'),
      ]);

      console.log('Processed responses:');
      console.log('Episodes data structure:', {
        success: episodesData.success,
        dataType: Array.isArray(episodesData.data)
          ? 'array'
          : typeof episodesData.data,
        dataLength: Array.isArray(episodesData.data)
          ? episodesData.data.length
          : 'N/A',
        firstEpisode:
          Array.isArray(episodesData.data) && episodesData.data[0]
            ? {
                id: episodesData.data[0].id,
                title: episodesData.data[0].title,
                hasAudioUrl: !!episodesData.data[0].audioUrl,
              }
            : 'N/A',
      });
      console.log('Podcast info data structure:', {
        success: podcastInfoData.success,
        dataType: typeof podcastInfoData.data,
        title: podcastInfoData.data?.title,
      });

      // Check if both requests were successful
      if (!episodesData.success) {
        throw new Error(
          episodesData.error || 'Episodes function returned success: false'
        );
      }

      if (!podcastInfoData.success) {
        throw new Error(
          podcastInfoData.error ||
            'Podcast info function returned success: false'
        );
      }

      // Process episodes data
      if (episodesData.data && Array.isArray(episodesData.data)) {
        const processedEpisodes: Episode[] = episodesData.data.map(
          (episode: any) => ({
            ...episode,
            publishDate: new Date(episode.publishDate), // Ensure dates are Date objects
          })
        );
        console.log(`Processed ${processedEpisodes.length} episodes`);
        setEpisodes(processedEpisodes);
      } else {
        throw new Error(
          `Episodes data is invalid. Expected array, got: ${typeof episodesData.data}`
        );
      }

      // Set podcast info
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
        console.log(`Processed podcast info: ${processedPodcast.title}`);
        setPodcast(processedPodcast);
      } else {
        throw new Error('Podcast info data is missing');
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred while fetching RSS data';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage =
            'Request timed out. The functions may be taking too long to respond.';
        } else if (err.message.includes('JSON.parse')) {
          errorMessage = `JSON parsing failed: ${err.message}. Check browser console for details.`;
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to the functions.';
        } else {
          errorMessage = err.message;
        }
      }

      console.error('Final error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, getApiUrl]);

  const refetch = () => {
    console.log('Manual refetch triggered');
    fetchRSSData();
  };

  useEffect(() => {
    console.log('useRSSFeed hook initializing with:', { limit, offset });
    fetchRSSData();
  }, [fetchRSSData, limit, offset]);

  return {
    episodes,
    podcast,
    loading,
    error,
    refetch,
  };
};
