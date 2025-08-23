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

    const request = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    // Set timeout
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
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
    const item = element[0];
    if (typeof item === 'object' && item._) {
      return String(item._).trim();
    }
    return String(item).trim();
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
  if (typeof element === 'object' && element.$?.url) {
    return element.$.url;
  }
  return String(element).trim();
};

/**
 * extracts audio URL from enclosure element
 * @param enclosure - enclosure element from RSS item
 * @returns audio URL or empty string
 */
const extractAudioUrl = (enclosure: any): string => {
  if (!enclosure) return '';
  if (Array.isArray(enclosure) && enclosure.length > 0) {
    const item = enclosure[0];
    if (item.$ && item.$.url) {
      return item.$.url;
    }
  }
  if (enclosure.$ && enclosure.$.url) {
    return enclosure.$.url;
  }
  return '';
};

/**
 * parses duration string and converts to readable format
 * @param duration - duration in various formats (HH:MM:SS, MM:SS, or seconds)
 * @returns formatted duration string
 */
const parseDuration = (duration: string): string => {
  if (!duration || typeof duration !== 'string') return '00:00';

  const trimmedDuration = duration.trim();
  if (!trimmedDuration) return '00:00';

  // if already in HH:MM:SS or MM:SS format
  if (trimmedDuration.includes(':')) {
    const parts = trimmedDuration.split(':').filter((part) => part !== '');

    if (parts.length === 2 && parts[0] && parts[1]) {
      const minutes = parts[0];
      const seconds = parts[1];
      const parsedMinutes = parseInt(minutes, 10);
      const parsedSeconds = parseInt(seconds, 10);

      if (!isNaN(parsedMinutes) && !isNaN(parsedSeconds)) {
        return `${parsedMinutes.toString().padStart(2, '0')}:${parsedSeconds
          .toString()
          .padStart(2, '0')}`;
      }
    }

    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const hours = parts[0];
      const minutes = parts[1];
      const seconds = parts[2];
      const parsedHours = parseInt(hours, 10);
      const parsedMinutes = parseInt(minutes, 10);
      const parsedSeconds = parseInt(seconds, 10);

      if (
        !isNaN(parsedHours) &&
        !isNaN(parsedMinutes) &&
        !isNaN(parsedSeconds)
      ) {
        return `${parsedHours.toString().padStart(2, '0')}:${parsedMinutes
          .toString()
          .padStart(2, '0')}:${parsedSeconds.toString().padStart(2, '0')}`;
      }
    }

    // fallback if parsing failed but format looked like time
    return trimmedDuration;
  }

  // if duration is in seconds
  const secondsValue = parseInt(trimmedDuration, 10);
  if (!isNaN(secondsValue) && secondsValue >= 0) {
    const hours = Math.floor(secondsValue / 3600);
    const minutes = Math.floor((secondsValue % 3600) / 60);
    const remainingSeconds = secondsValue % 60;

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

  // fallback for any unrecognized format
  return '00:00';
};

/**
 * strips HTML tags from string
 * @param html - HTML string
 * @returns plain text string
 */
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * parses rss feed and extracts podcast info + episodes
 * @param rssUrl - url of the rss feed
 * @returns promise resolving to parsed rss data
 */
export const parseRSSFeed = async (rssUrl: string): Promise<RSSResponse> => {
  try {
    console.log(`Fetching RSS feed from: ${rssUrl}`);
    const xmlContent = await fetchRSSContent(rssUrl);
    const parsedXml = await parseStringPromise(xmlContent, {
      explicitArray: true,
      ignoreAttrs: false,
      mergeAttrs: false,
    });

    const channel = parsedXml.rss?.channel?.[0];
    if (!channel) {
      throw new Error('Invalid RSS feed structure - no channel found');
    }

    // extract podcast metadata
    const podcast: PodcastInfo = {
      title: extractText(channel.title),
      description: stripHtml(extractText(channel.description)),
      imageUrl:
        extractUrl(channel.image?.[0]?.url) ||
        extractUrl(channel['itunes:image']),
      author:
        extractText(channel['itunes:author']) ||
        extractText(channel.managingEditor) ||
        'Unknown',
      categories: (channel['itunes:category'] || [])
        .map((cat: any) => extractText(cat.$?.text || cat))
        .filter(Boolean),
      language: extractText(channel.language) || 'en',
      lastBuildDate: new Date(
        extractText(channel.lastBuildDate) ||
          extractText(channel.pubDate) ||
          Date.now()
      ),
    };

    // extract episodes
    const items = channel.item || [];
    console.log(`Found ${items.length} episodes in RSS feed`);

    const episodes: Episode[] = items.map((item: any, index: number) => {
      const guid = extractText(item.guid);
      const audioUrl = extractAudioUrl(item.enclosure);

      if (!audioUrl) {
        console.warn(`Episode ${index} missing audio URL`);
      }

      return {
        id: guid || `episode-${index}`,
        title: extractText(item.title),
        description: stripHtml(
          extractText(item.description) || extractText(item['itunes:summary'])
        ),
        audioUrl,
        publishDate: new Date(extractText(item.pubDate) || Date.now()),
        duration: parseDuration(extractText(item['itunes:duration'])),
        episodeNumber:
          parseInt(extractText(item['itunes:episode']), 10) || undefined,
        season: parseInt(extractText(item['itunes:season']), 10) || undefined,
        imageUrl: extractUrl(item['itunes:image']) || podcast.imageUrl,
      };
    });

    const validEpisodes = episodes.filter((ep) => ep.audioUrl);
    console.log(`Parsed ${validEpisodes.length} valid episodes`);

    return {
      podcast,
      episodes: validEpisodes.sort(
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
