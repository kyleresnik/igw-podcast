import { Router, type Request, type Response } from 'express';
import { parseRSSFeed } from '../utils/rssParser';

const router = Router();

// interface for rss feed request query parameters
interface RSSQuery {
  limit?: string;
  offset?: string;
}

// GET /api/rss/episodes
// fetch and return parsed podcast episodes from rss feed
router.get(
  '/episodes',
  async (req: Request<{}, {}, {}, RSSQuery>, res: Response) => {
    try {
      const limit = parseInt(req.query.limit || '10', 10);
      const offset = parseInt(req.query.offset || '0', 10);

      const rssUrl = process.env.RSS_FEED_URL;

      if (!rssUrl) {
        return res.status(500).json({
          success: false,
          error: 'RSS feed URL not configured',
          timestamp: new Date().toISOString(),
        });
      }

      const feedData = await parseRSSFeed(rssUrl);

      // episodes pagination
      const paginatedEpisodes = feedData.episodes.slice(offset, offset + limit);

      res.json({
        success: true,
        data: {
          podcast: feedData.podcast,
          episodes: paginatedEpisodes,
          pagination: {
            total: feedData.episodes.length,
            limit,
            offset,
            hasMore: offset + limit < feedData.episodes.length,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch RSS feed',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// GET /api/rss/podcast-info
// get podcast metadata information
router.get('/podcast-info', async (req: Request, res: Response) => {
  try {
    const rssUrl = process.env.RSS_FEED_URL;

    if (!rssUrl) {
      return res.status(500).json({
        success: false,
        error: 'RSS feed URL not configured',
        timestamp: new Date().toISOString(),
      });
    }

    const feedData = await parseRSSFeed(rssUrl);

    res.json({
      success: true,
      data: feedData.podcast,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching podcast info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch podcast information',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
