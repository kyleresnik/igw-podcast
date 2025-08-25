import { Router, type Request, type Response } from 'express';
import { parseRSSFeed } from '../utils/rssParser.js';

const router = Router();

// interface for rss feed request query parameters
interface RSSQuery {
  limit?: string;
  offset?: string;
}

// GET /api/rss
// base route with API information
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'It Gets Weird Podcast RSS API',
    endpoints: {
      episodes: '/api/rss/episodes?limit=10&offset=0',
      podcastInfo: '/api/rss/podcast-info',
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/rss/episodes
// fetch and return parsed podcast episodes from rss feed
router.get(
  '/episodes',
  async (req: Request<{}, {}, {}, RSSQuery>, res: Response) => {
    try {
      console.log('Fetching episodes with query:', req.query);

      const limit = Math.min(parseInt(req.query.limit || '10', 10), 100); // max 100
      const offset = Math.max(parseInt(req.query.offset || '0', 10), 0); // min 0

      const rssUrl = process.env.RSS_FEED_URL;

      if (!rssUrl) {
        console.error('RSS_FEED_URL environment variable not configured');
        return res.status(500).json({
          success: false,
          error: 'RSS feed URL not configured',
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`🔄 Parsing RSS feed: ${rssUrl}`);
      const feedData = await parseRSSFeed(rssUrl);

      // episodes pagination
      const paginatedEpisodes = feedData.episodes.slice(offset, offset + limit);

      console.log(`Successfully fetched ${paginatedEpisodes.length} episodes`);

      return res.json({
        success: true,
        data: paginatedEpisodes,
        pagination: {
          total: feedData.episodes.length,
          limit,
          offset,
          hasMore: offset + limit < feedData.episodes.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching RSS feed:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch RSS feed',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// GET /api/rss/podcast-info
// get podcast metadata information
router.get('/podcast-info', async (req: Request, res: Response) => {
  try {
    console.log('Fetching podcast info');

    const rssUrl = process.env.RSS_FEED_URL;

    if (!rssUrl) {
      console.error('RSS_FEED_URL environment variable not configured');
      return res.status(500).json({
        success: false,
        error: 'RSS feed URL not configured',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Parsing RSS feed for podcast info: ${rssUrl}`);
    const feedData = await parseRSSFeed(rssUrl);

    console.log(`Successfully fetched podcast info: ${feedData.podcast.title}`);

    return res.json({
      success: true,
      data: feedData.podcast,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching podcast info:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch podcast information',
      details: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
