import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { parseRSSFeed } from './utils/rssParser';

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // cors headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // 5 minute cache
  };

  // handle preflight cors requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // only allow GET requests
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
    // log request
    console.log(
      `[Episodes] ${event.httpMethod} ${event.path} - ${event.headers['user-agent']}`
    );
    console.log('[Episodes] Query params:', event.queryStringParameters);

    // extract query parameters (same as express req.query)
    const { limit = '10', offset = '0' } = event.queryStringParameters || {};

    // validate and sanitize parameters
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

    console.log(
      `[Episodes] Requesting ${limitNum} episodes starting from ${offsetNum}`
    );

    // get rss url from environment
    const rssUrl = process.env.RSS_FEED_URL;

    if (!rssUrl) {
      console.error(
        '[Episodes] RSS_FEED_URL environment variable not configured'
      );
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

    // parse rss feed
    console.log(`[Episodes] Parsing RSS feed: ${rssUrl}`);
    const feedData = await parseRSSFeed(rssUrl);

    // apply pagination
    const paginatedEpisodes = feedData.episodes.slice(
      offsetNum,
      offsetNum + limitNum
    );

    console.log(
      `[Episodes] Successfully returning ${paginatedEpisodes.length} episodes`
    );

    // return response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: paginatedEpisodes, // direct array as expected by client
        pagination: {
          total: feedData.episodes.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < feedData.episodes.length,
        },
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('[Episodes] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const isNetworkError =
      errorMessage.includes('timeout') ||
      errorMessage.includes('Request failed') ||
      errorMessage.includes('ENOTFOUND');

    return {
      statusCode: isNetworkError ? 503 : 500, // service unavailable for network issues
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch episodes',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
