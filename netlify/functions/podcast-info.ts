import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// import the rss parser function
let parseRSSFeed: any;
try {
  const rssParserModule = require('./utils/rssParser');
  parseRSSFeed = rssParserModule.parseRSSFeed;
} catch (error) {
  console.error('Failed to import RSS parser:', error);
}

const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // cors headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=600', // 10 minute cache for podcast info
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
      `[Podcast Info] ${event.httpMethod} ${event.path} - ${event.headers['user-agent']}`
    );

    // get rss url from environment
    const rssUrl = process.env.RSS_FEED_URL;

    if (!rssUrl) {
      console.error(
        '[Podcast Info] RSS_FEED_URL environment variable not configured'
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

    if (!parseRSSFeed) {
      console.error('[Podcast Info] RSS parser not available');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'RSS parser not available',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // parse rss feed for podcast metadata
    console.log(`[Podcast Info] Parsing RSS feed for metadata: ${rssUrl}`);
    const feedData = await parseRSSFeed(rssUrl);

    console.log(
      `[Podcast Info] Successfully fetched info for: ${feedData.podcast.title}`
    );

    // return response
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

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const isNetworkError =
      errorMessage.includes('timeout') ||
      errorMessage.includes('Request failed') ||
      errorMessage.includes('ENOTFOUND');

    return {
      statusCode: isNetworkError ? 503 : 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch podcast information',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

// export for netlify functions
exports.handler = handler;
