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
 * Enhanced for Netlify Functions with better error handling and debugging
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

      // always use /.netlify/functions for netlify deployments
      const apiUrl = '/.netlify/functions';
      const url = `${apiUrl}/podcast-info`;

      console.log('🔍 [Podcast Info Debug] Fetching from:', url);

      // fetch with timeout and debugging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      console.log('🌐 [Podcast Info] Starting fetch...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[Podcast Info] Response status:', response.status);
      console.log(
        '[Podcast Info] Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('[Podcast Info] Error response body:', errorText);
        } catch (e) {
          console.error('[Podcast Info] Could not read error response');
        }
        throw new Error(
          `Podcast info failed with status ${response.status}: ${errorText.slice(0, 200)}`
        );
      }

      // Get the response text first to debug JSON parsing issues
      const responseText = await response.text();
      console.log(
        '[Podcast Info] Raw response (first 500 chars):',
        responseText.slice(0, 500)
      );

      // Try to parse as JSON
      let data: ApiResponse<PodcastInfo>;
      try {
        data = JSON.parse(responseText);
        console.log('[Podcast Info] Successfully parsed JSON');
      } catch (parseError) {
        console.error('❌ [Podcast Info] JSON parse error:', parseError);
        console.error(
          '❌ [Podcast Info] Response that failed to parse:',
          responseText
        );
        throw new Error(
          `Podcast info returned invalid JSON. Got: ${responseText.slice(0, 100)}...`
        );
      }

      console.log('[Podcast Info Debug] Processed response:', {
        success: data.success,
        dataType: typeof data.data,
        title: data.data?.title,
      });

      if (data.success && data.data) {
        const processedPodcast: PodcastInfo = {
          ...data.data,
          lastBuildDate: data.data.lastBuildDate
            ? new Date(data.data.lastBuildDate)
            : undefined,
          pubDate: data.data.pubDate ? new Date(data.data.pubDate) : undefined,
        };
        console.log(
          `[Podcast Info Debug] Processed podcast: ${processedPodcast.title}`
        );
        setPodcast(processedPodcast);
      } else {
        throw new Error(
          data.error || 'Podcast info function returned success: false'
        );
      }
    } catch (err) {
      let errorMessage =
        'An unknown error occurred while fetching podcast info';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage =
            'Request timed out. The function may be taking too long to respond.';
        } else if (err.message.includes('JSON.parse')) {
          errorMessage = `JSON parsing failed: ${err.message}. Check browser console for details.`;
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to the function.';
        } else {
          errorMessage = err.message;
        }
      }

      console.error('[Podcast Info Debug] Final error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('[Podcast Info Debug] Manual refetch triggered');
    fetchPodcastInfo();
  };

  useEffect(() => {
    console.log('[Podcast Info Debug] usePodcastInfo hook initializing');
    fetchPodcastInfo();
  }, []);

  return {
    podcast,
    loading,
    error,
    refetch,
  };
};
