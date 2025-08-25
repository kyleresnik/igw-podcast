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

// import rss parsing functionality dynamically
const parseRSSFeed = async (rssUrl: string): Promise<RSSResponse> => {
  const https = await import('https');
  const http = await import('http');

  // simple xml to js parser without external dependencies
  const xml2js = require('xml2js');

  const fetchRSSContent = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https.default : http.default;

      const request = client.get(
        url,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'It Gets Weird Podcast Website/1.0',
            Accept: 'application/rss+xml, application/xml, text/xml',
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            return;
          }

          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => resolve(data));
        }
      );

      request.on('error', (err) =>
        reject(new Error(`Request failed: ${err.message}`))
      );
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  };

  const extractText = (element: any): string => {
    if (!element) return '';
    if (Array.isArray(element) && element.length > 0) {
      const item = element[0];
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object') {
        if (item._) return String(item._).trim();
        return String(item).trim();
      }
    }
    return String(element).trim();
  };

  const extractAttribute = (element: any, attribute: string): string => {
    if (!element) return '';
    if (Array.isArray(element) && element.length > 0) {
      const item = element[0];
      if (item.$ && item.$[attribute]) return String(item.$[attribute]).trim();
    }
    if (element.$ && element.$[attribute])
      return String(element.$[attribute]).trim();
    return '';
  };

  const stripHtml = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  const xmlContent = await fetchRSSContent(rssUrl);
  const parsedXml = await xml2js.parseStringPromise(xmlContent, {
    explicitArray: true,
    ignoreAttrs: false,
  });

  const channel = parsedXml.rss?.channel?.[0];
  if (!channel) throw new Error('Invalid RSS feed structure');

  const podcast: PodcastInfo = {
    title: extractText(channel.title),
    description: stripHtml(extractText(channel.description)),
    imageUrl: extractAttribute(channel['itunes:image'], 'href'),
    author: extractText(channel['itunes:author']) || 'Unknown',
    categories: [],
    language: extractText(channel.language) || 'en',
    lastBuildDate: new Date(),
    explicit: false,
    type: 'episodic',
  };

  const items = channel.item || [];
  const episodes: Episode[] = items
    .map((item: any, index: number) => ({
      id: extractText(item.guid) || `episode-${index}`,
      title: extractText(item.title),
      description: stripHtml(extractText(item.description)),
      audioUrl: item.enclosure?.[0]?.$.url || '',
      publishDate: new Date(extractText(item.pubDate)),
      duration: extractText(item['itunes:duration']) || '00:00',
      imageUrl: podcast.imageUrl,
    }))
    .filter((ep: Episode) => ep.audioUrl && ep.title);

  return {
    podcast,
    episodes: episodes.sort(
      (a, b) => b.publishDate.getTime() - a.publishDate.getTime()
    ),
  };
};

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

    const feedData = await parseRSSFeed(rssUrl);

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
