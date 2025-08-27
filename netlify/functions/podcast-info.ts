import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// define interfaces locally to avoid import issues
interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  publishDate: Date;
  duration: string;
  episodeNumber?: number;
  season?: number;
  imageUrl?: string;
  explicit?: boolean;
  keywords?: string[];
  subtitle?: string;
}

interface PodcastInfo {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  categories: string[];
  language: string;
  lastBuildDate: Date;
  explicit: boolean;
  type: string;
  email?: string;
}

interface RSSResponse {
  podcast: PodcastInfo;
  episodes: Episode[];
}

// import shared RSS parser
const { parseRSSFeed } = require('./utils/rssParser');

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=600',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  try {
    const rssUrl = process.env.RSS_FEED_URL;
    if (!rssUrl) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'RSS feed URL not configured',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    const feedData: RSSResponse = await parseRSSFeed(rssUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: feedData.podcast,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('[Podcast Info] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch podcast information',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
