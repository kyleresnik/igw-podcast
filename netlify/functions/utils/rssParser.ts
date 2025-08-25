import https from 'https';
import http from 'http';
import { parseStringPromise } from 'xml2js';

// episode interface
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

// fetches rss feed content from url with timeout handling
const fetchRSSContent = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;

    // set shorter timeout for serverless functions
    const request = client.get(
      url,
      {
        timeout: 10000, // 10 seconds
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

        res.on('end', () => {
          if (data.trim().length === 0) {
            reject(new Error('Empty response from RSS feed'));
            return;
          }
          resolve(data);
        });
      }
    );

    request.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout after 10 seconds'));
    });

    request.setTimeout(10000);
  });
};

// safe extraction of text content from xml element
const extractText = (element: any): string => {
  if (!element) return '';

  if (Array.isArray(element)) {
    if (element.length > 0) {
      const item = element[0];
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

// safe extraction of attribute values from xml element
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

// extract audio url from enclosure element
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

// parse duration string and convert to readable format
const parseDuration = (duration: string): string => {
  if (!duration || typeof duration !== 'string') return '00:00';

  const trimmedDuration = duration.trim();
  if (!trimmedDuration) return '00:00';

  // if already in time format
  if (trimmedDuration.includes(':')) {
    const parts = trimmedDuration.split(':').filter((part) => part !== '');

    if (parts.length === 2 && parts[0] && parts[1]) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);

      if (!isNaN(minutes) && !isNaN(seconds)) {
        return `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;
      }
    }

    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);

      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        return `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }

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

  return '00:00';
};

// strip html tags and decode entities
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

// parse boolean values from itunes explicit field
const parseExplicit = (value: string): boolean => {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === 'yes';
};

/**
 * main rss parsing function for netlify Functions
 * @param rssUrl - url of the rss feed
 * @returns promise resolving to parsed rss data
 */
export const parseRSSFeed = async (rssUrl: string): Promise<RSSResponse> => {
  try {
    console.log(`[RSS Parser] Fetching feed from: ${rssUrl}`);
    const startTime = Date.now();

    const xmlContent = await fetchRSSContent(rssUrl);
    console.log(`[RSS Parser] XML fetched in ${Date.now() - startTime}ms`);

    const parseStartTime = Date.now();
    const parsedXml = await parseStringPromise(xmlContent, {
      explicitArray: true,
      ignoreAttrs: false,
      mergeAttrs: false,
      explicitCharkey: false,
      trim: true,
      normalizeTags: false,
      normalize: true,
    });
    console.log(`[RSS Parser] XML parsed in ${Date.now() - parseStartTime}ms`);

    const channel = parsedXml.rss?.channel?.[0];
    if (!channel) {
      throw new Error('Invalid RSS feed structure - no channel found');
    }

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

    console.log(`[RSS Parser] Podcast: ${podcast.title} by ${podcast.author}`);

    // extract episodes
    const items = channel.item || [];
    console.log(`[RSS Parser] Processing ${items.length} episodes`);

    const episodes: Episode[] = items.map((item: any, index: number) => {
      const guid = extractText(item.guid);
      const audioUrl = extractAudioUrl(item.enclosure);

      if (!audioUrl) {
        console.warn(`[RSS Parser] Episode ${index} missing audio URL`);
      }

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

      // add optional properties only if valid
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
    console.log(
      `[RSS Parser] ${validEpisodes.length} valid episodes processed`
    );

    const totalTime = Date.now() - startTime;
    console.log(`[RSS Parser] Complete in ${totalTime}ms`);

    return {
      podcast,
      episodes: validEpisodes.sort(
        (a, b) => b.publishDate.getTime() - a.publishDate.getTime()
      ),
    };
  } catch (error) {
    console.error('[RSS Parser] Error:', error);
    throw new Error(
      `Failed to parse RSS feed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
