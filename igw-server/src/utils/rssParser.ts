import https from 'https';
import http from 'http';
import { parseStringPromise } from 'xml2js';

// episode interface matches client-side types
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
}

// podcast metadata interface
interface PodcastInfo {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  categories: string[];
  language: string;
  lastBuildDate: Date;
}

// rss response structure
interface RSSResponse {
  podcast: PodcastInfo;
  episodes: Episode[];
}

/**
 * fetches rss feed content from URL
 * @param url - RSS feed URL
 * @returns promise resolving to RSS XML content
 */
const fetchRSSContent = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

/**
 * safe extraction of text content from xml element
 * @param element - xml element or array of elements
 * @returns extracted text content or empty string
 */
const extractText = (element: any): string => {
  if (!element) return '';
  if (Array.isArray(element) && element.length > 0) {
    return String(element[0]).trim();
  }
  return String(element).trim();
};

/**
 * safe extraction of url from xml element w/possible attributes
 * @param element - xml element
 * @returns extracted url or empty string
 */
const extractUrl = (element: any): string => {
  if (!element) return '';
  if (Array.isArray(element) && element.length > 0) {
    const item = element[0];
    if (typeof item === 'object' && item.$?.href) {
      return item.$.href;
    }
    if (typeof item === 'object' && item.$?.url) {
      return item.$.url;
    }
    return String(item).trim();
  }
  return String(element).trim();
};

/**
 * parses duration string and converts to readable format
 * @param duration - duration in various formats (HH:MM:SS)
 * @returns formatted duration string
 */
const parseDuration = (duration: string): string => {
  if (!duration) return '00:00';

  // if already in HH:MM:SS or MM:SS format
  if (duration.includes(':')) {
    return duration;
  }

  // if duration is in seconds
  const seconds = parseInt(duration, 10);
  if (!isNaN(seconds)) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    }
  }

  return duration;
};

/**
 * parses rss feed and extracts podcast info + episodes
 * @param rssUrl - url of the rss feed
 * @returns promise resolving to parsed rss data
 */
export const parseRSSFeed = async (rssUrl: string): Promise<RSSResponse> => {
  try {
    const xmlContent = await fetchRSSContent(rssUrl);
    const parsedXml = await parseStringPromise(xmlContent);

    const channel = parsedXml.rss?.channel?.[0];
    if (!channel) {
      throw new Error('Invalid RSS feed structure');
    }

    // extract podcast metadata
    const podcast: PodcastInfo = {
      title: extractText(channel.title),
      description: extractText(channel.description),
      imageUrl: extractUrl(channel.image?.[0]?.url || channel['itunes:image']),
      author: extractText(channel['itunes:author'] || channel.managingEditor),
      categories: (channel['itunes:category'] || [])
        .map((cat: any) => extractText(cat.$?.text || cat))
        .filter(Boolean),
      language: extractText(channel.language || 'en'),
      lastBuildDate: new Date(
        extractText(channel.lastBuildDate || channel.pubDate) || Date.now()
      ),
    };

    // extract episodes
    const items = channel.item || [];
    const episodes: Episode[] = items.map((item: any, index: number) => {
      const enclosure = item.enclosure?.[0];
      const guid = extractText(item.guid);

      return {
        id: guid || `episode-${index}`,
        title: extractText(item.title),
        description: extractText(item.description || item['itunes:summary']),
        audioUrl: extractUrl(enclosure?.$ || enclosure),
        publishDate: new Date(extractText(item.pubDate) || Date.now()),
        duration: parseDuration(extractText(item['itunes:duration'])),
        episodeNumber:
          parseInt(extractText(item['itunes:episode']), 10) || undefined,
        season: parseInt(extractText(item['itunes:season']), 10) || undefined,
        imageUrl: extractUrl(item['itunes:image']) || podcast.imageUrl,
      };
    });

    return {
      podcast,
      episodes: episodes.sort(
        (a, b) => b.publishDate.getTime() - a.publishDate.getTime()
      ),
    };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw new Error(
      `Failed to parse RSS feed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
