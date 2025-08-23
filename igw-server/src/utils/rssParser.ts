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
  explicit?: boolean;
  keywords?: string[];
  subtitle?: string;
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
  explicit: boolean;
  type: string;
  email?: string;
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

    // set timeout
    request.setTimeout(15000, () => {
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

  if (Array.isArray(element)) {
    if (element.length > 0) {
      const item = element[0];
      // handle xml's CDATA sections
      if (typeof item === 'string') {
        return item.trim();
      }
      if (typeof item === 'object') {
        if (item._) return String(item._).trim();
        if (item.$t) return String(item.$t).trim();
        return String(item).trim();
      }
    }
    return '';
  }

  if (typeof element === 'object') {
    if (element._) return String(element._).trim();
    if (element.$t) return String(element.$t).trim();
  }

  return String(element).trim();
};

/**
 * safe extraction of attribute values from xml element
 * @param element - xml element
 * @param attribute - attribute name
 * @returns extracted attribute value or empty string
 */
const extractAttribute = (element: any, attribute: string): string => {
  if (!element) return '';

  if (Array.isArray(element) && element.length > 0) {
    const item = element[0];
    if (item.$ && item.$[attribute]) {
      return String(item.$[attribute]).trim();
    }
  }

  if (element.$ && element.$[attribute]) {
    return String(element.$[attribute]).trim();
  }

  return '';
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
 * strips HTML tags from string and decodes HTML entities
 * @param html - HTML string
 * @returns plain text string
 */
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&') // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
};

/**
 * parses boolean values from iTunes explicit field
 * @param value - string value that might be 'true', 'false', 'yes', 'no'
 * @returns boolean value
 */
const parseExplicit = (value: string): boolean => {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === 'yes';
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
      explicitCharkey: false,
      trim: true,
      normalizeTags: false,
      normalize: true,
    });

    console.log('XML parsed successfully');

    const channel = parsedXml.rss?.channel?.[0];
    if (!channel) {
      throw new Error('Invalid RSS feed structure - no channel found');
    }

    console.log('Channel found, extracting podcast metadata...');

    // extract podcast metadata
    const podcast: PodcastInfo = {
      title: extractText(channel.title),
      description: stripHtml(
        extractText(channel.description) ||
          extractText(channel['itunes:summary'])
      ),
      imageUrl:
        extractAttribute(channel['itunes:image'], 'href') ||
        extractText(channel.image?.[0]?.url),
      author:
        extractText(channel['itunes:author']) ||
        extractText(channel.managingEditor) ||
        'Unknown',
      categories: (channel['itunes:category'] || [])
        .map((cat: any) => extractAttribute(cat, 'text'))
        .filter(Boolean),
      language: extractText(channel.language) || 'en',
      lastBuildDate: new Date(
        extractText(channel.lastBuildDate) ||
          extractText(channel.pubDate) ||
          Date.now()
      ),
      explicit: parseExplicit(extractText(channel['itunes:explicit'])),
      type: extractText(channel['itunes:type']) || 'episodic',
      email: extractText(channel['itunes:owner']?.[0]?.[0]?.['itunes:email']),
    };

    console.log(
      `Podcast metadata extracted: ${podcast.title} by ${podcast.author}`
    );

    // extract episodes
    const items = channel.item || [];
    console.log(`Found ${items.length} episodes in RSS feed`);

    const episodes: Episode[] = items.map((item: any, index: number) => {
      const guid = extractText(item.guid);
      const audioUrl = extractAudioUrl(item.enclosure);

      if (!audioUrl) {
        console.warn(`Episode ${index} missing audio URL`);
      }

      // parse episode number with type handling
      const episodeNumberText = extractText(item['itunes:episode']);
      const seasonText = extractText(item['itunes:season']);
      const keywordsText = extractText(item['itunes:keywords']);

      const parsedEpisodeNumber = episodeNumberText
        ? parseInt(episodeNumberText, 10)
        : NaN;
      const parsedSeason = seasonText ? parseInt(seasonText, 10) : NaN;

      const episode: Episode = {
        id: guid || `episode-${index}`,
        title: extractText(item.title) || extractText(item['itunes:title']),
        description: stripHtml(
          extractText(item['content:encoded']) ||
            extractText(item.description) ||
            extractText(item['itunes:summary']) ||
            extractText(item['itunes:subtitle'])
        ),
        audioUrl,
        publishDate: new Date(extractText(item.pubDate) || Date.now()),
        duration: parseDuration(extractText(item['itunes:duration'])),
        imageUrl:
          extractAttribute(item['itunes:image'], 'href') || podcast.imageUrl,
        explicit: parseExplicit(extractText(item['itunes:explicit'])),
        subtitle: stripHtml(extractText(item['itunes:subtitle'])),
      };

      // add optional properties only if they have valid values
      if (!isNaN(parsedEpisodeNumber) && parsedEpisodeNumber > 0) {
        episode.episodeNumber = parsedEpisodeNumber;
      }

      if (!isNaN(parsedSeason) && parsedSeason > 0) {
        episode.season = parsedSeason;
      }

      if (keywordsText) {
        const parsedKeywords = keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        if (parsedKeywords.length > 0) {
          episode.keywords = parsedKeywords;
        }
      }

      return episode;
    });

    const validEpisodes = episodes.filter((ep) => ep.audioUrl && ep.title);
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
