import { Episode, PodcastInfo, RSSResponse } from '../types/podcast';

/**
 * utility functions for parsing rss data from server api response
 * parse rss xml data into structured podcast and episode data
 * assuming the server has already parsed the xml and returns json
 */
export class RSSParser {
  /**
   * parse api response into podcast info and episodes
   * @param data - parsed rss data from server
   * @returns structured rss response
   */
  static parseServerResponse(data: any): RSSResponse {
    const podcast = this.parsePodcastInfo(data.channel || data);
    const episodes = this.parseEpisodes(data.channel?.item || data.items || []);

    return {
      podcast,
      episodes,
    };
  }

  // parse podcast metadata from rss channel data
  private static parsePodcastInfo(channelData: any): PodcastInfo {
    return {
      title: this.extractText(channelData.title) || 'Unknown Podcast',
      description: this.extractText(channelData.description) || '',
      imageUrl: this.extractImageUrl(channelData),
      author:
        this.extractText(channelData['itunes:author']) ||
        this.extractText(channelData.managingEditor) ||
        '',
      categories: this.extractCategories(channelData),
      language: this.extractText(channelData.language) || 'en',
      lastBuildDate: this.parseDate(channelData.lastBuildDate),
      pubDate: this.parseDate(channelData.pubDate),
      link: this.extractText(channelData.link) || '',
      managingEditor: this.extractText(channelData.managingEditor) || '',
      explicit: this.extractText(channelData['itunes:explicit']) === 'true',
    };
  }

  // parse episodes from rss items
  private static parseEpisodes(items: any[]): Episode[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item, index) => this.parseEpisode(item, index));
  }

  // parse individual episode from RSS item
  private static parseEpisode(item: any, index: number): Episode {
    const guid = this.extractText(item.guid) || `episode-${index}`;
    const title = this.extractText(item.title) || `Episode ${index + 1}`;
    const description =
      this.extractText(item.description) ||
      this.extractText(item['content:encoded']) ||
      '';

    return {
      id: guid,
      title,
      description,
      audioUrl: this.extractAudioUrl(item),
      publishDate: this.parseDate(item.pubDate) || new Date(),
      duration: this.extractText(item['itunes:duration']) || undefined,
      episodeNumber: this.extractEpisodeNumber(item),
      season: this.extractSeasonNumber(item),
      imageUrl: this.extractImageUrl(item),
      keywords: this.extractKeywords(item),
      explicit: this.extractText(item['itunes:explicit']) === 'true',
      episodeType: this.extractText(item['itunes:episodeType']) || 'full',
      author: this.extractText(item['itunes:author']) || undefined,
    };
  }

  // extract rss field text (handles CDATA and nested objects)
  private static extractText(field: any): string | undefined {
    if (!field) return undefined;

    if (typeof field === 'string') {
      return field.trim();
    }

    if (typeof field === 'object') {
      // handle CDATA
      if (field._cdata) {
        return field._cdata.trim();
      }
      // handle nested text
      if (field._text || field.$t) {
        return (field._text || field.$t).trim();
      }
      // handle direct text content
      if (field._ || field['#text']) {
        return (field._ || field['#text']).trim();
      }
    }

    return String(field).trim();
  }

  // extract audio url from enclosure or media fields
  private static extractAudioUrl(item: any): string {
    // try enclosure first
    if (item.enclosure) {
      const enclosure = Array.isArray(item.enclosure)
        ? item.enclosure[0]
        : item.enclosure;
      if (enclosure.url || enclosure.$?.url) {
        return enclosure.url || enclosure.$.url;
      }
    }

    // try media:content
    if (item['media:content']) {
      const media = Array.isArray(item['media:content'])
        ? item['media:content'][0]
        : item['media:content'];
      if (media.url || media.$?.url) {
        return media.url || media.$.url;
      }
    }

    // fallback to link
    return this.extractText(item.link) || '';
  }

  // extract image url from itunes or media fields
  private static extractImageUrl(data: any): string | undefined {
    // try itunes image
    if (data['itunes:image']) {
      const image = data['itunes:image'];
      if (image.href || image.$?.href) {
        return image.href || image.$.href;
      }
    }

    // try regular image
    if (data.image) {
      if (typeof data.image === 'string') {
        return data.image;
      }
      if (data.image.url) {
        return this.extractText(data.image.url);
      }
    }

    // TODO: figure out a fallback image setup
    return undefined;
  }

  // extract categories from itunes or regular category fields
  private static extractCategories(data: any): string[] {
    const categories: string[] = [];

    // itunes categories
    if (data['itunes:category']) {
      const itunesCategories = Array.isArray(data['itunes:category'])
        ? data['itunes:category']
        : [data['itunes:category']];

      itunesCategories.forEach((cat: any) => {
        if (cat.text || cat.$?.text) {
          categories.push(cat.text || cat.$.text);
        }
      });
    }

    // regular categories
    if (data.category) {
      const regularCategories = Array.isArray(data.category)
        ? data.category
        : [data.category];

      regularCategories.forEach((cat: any) => {
        const text = this.extractText(cat);
        if (text) categories.push(text);
      });
    }

    return categories;
  }

  // extract episode number from itunes fields
  private static extractEpisodeNumber(item: any): number | undefined {
    const episodeNum = this.extractText(item['itunes:episode']);
    return episodeNum ? parseInt(episodeNum, 10) : undefined;
  }

  // extract season number from itunes fields
  private static extractSeasonNumber(item: any): number | undefined {
    const seasonNum = this.extractText(item['itunes:season']);
    return seasonNum ? parseInt(seasonNum, 10) : undefined;
  }

  // extract keywords from itunes fields
  private static extractKeywords(item: any): string[] | undefined {
    const keywords = this.extractText(item['itunes:keywords']);
    return keywords ? keywords.split(',').map((k) => k.trim()) : undefined;
  }

  // parse date string into Date object
  private static parseDate(dateString: any): Date | undefined {
    if (!dateString) return undefined;

    const dateText = this.extractText(dateString);
    if (!dateText) return undefined;

    const date = new Date(dateText);
    return isNaN(date.getTime()) ? undefined : date;
  }
}

// error handling for rss parsing
export class RSSParsingError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'RSSParsingError';
  }
}
