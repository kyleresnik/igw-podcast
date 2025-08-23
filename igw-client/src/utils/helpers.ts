// date formatting utilities
export class DateUtils {
  /**
   * formats a date for display in episode cards and lists
   * @param date - date to format
   * @param format - formatting style ('short', 'long', 'medium')
   * @returns formatted date string
   */
  static formatDate(
    date: Date,
    format: 'short' | 'long' | 'medium' = 'medium'
  ): string {
    if (!date || isNaN(date.getTime())) {
      return 'Unknown date';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'UTC',
    };

    switch (format) {
      case 'short':
        options.month = 'short';
        options.day = 'numeric';
        options.year = 'numeric';
        break;
      case 'long':
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'medium':
      default:
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  // format date for card display (shorter format)
  static formatCardDate(date: Date): string {
    return this.formatDate(date, 'short');
  }

  // format date for list display (medium format)
  static formatListDate(date: Date): string {
    return this.formatDate(date, 'long');
  }

  // get relative time (eg, "2 days ago", "1 week ago")
  static getRelativeTime(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return 'Unknown time';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    if (diffInWeeks < 4)
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    if (diffInMonths < 12)
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  }
}

// html and text formatting utilities
export class TextUtils {
  /**
   * strip html tags from string and decode html entities
   * @param html - html string to clean
   * @returns plain text string
   */
  static stripHtml(html: string): string {
    if (!html) return '';

    // create a temporary dom element to parse html
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;

    // get text content and clean up
    const text = tmp.textContent || tmp.innerText || '';

    // decode common html entities
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  /**
   * truncate text to a specified length with ellipsis
   * @param text - text to truncate
   * @param maxLength - maximum length
   * @param suffix - suffix to add (default: '...')
   * @returns truncated text
   */
  static truncateText(
    text: string,
    maxLength: number,
    suffix: string = '...'
  ): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * clean and truncate html content for display
   * @param html - html content
   * @param maxLength - max length for text
   * @returns clean, truncated text
   */
  static cleanAndTruncate(html: string, maxLength: number): string {
    const cleaned = this.stripHtml(html);
    return this.truncateText(cleaned, maxLength);
  }

  /**
   * convert duration from various formats to a readable string
   * @param duration - duration in seconds, MM:SS, or HH:MM:SS format
   * @returns formatted duration string
   */
  static formatDuration(duration: string | number | undefined): string {
    if (!duration) return '';

    // if it's already a formatted string, return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }

    // convert to seconds if it's a number or numeric string
    let totalSeconds: number;
    if (typeof duration === 'string') {
      totalSeconds = parseInt(duration, 10);
    } else {
      totalSeconds = duration;
    }

    if (isNaN(totalSeconds)) return '';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * capitalize first letter of each word
   * @param text - text to capitalize
   * @returns capitalized text
   */
  static capitalizeWords(text: string): string {
    if (!text) return '';

    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// url and media utilities
export class MediaUtils {
  /**
   * check if a url is a valid audio file
   * @param url - url to check
   * @returns true if url appears to be audio
   */
  static isAudioUrl(url: string): boolean {
    if (!url) return false;

    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const lowerUrl = url.toLowerCase();

    return audioExtensions.some((ext) => lowerUrl.includes(ext));
  }

  /**
   * check if a url is a valid image
   * @param url - url to check
   * @returns true if url appears to be an image
   */
  static isImageUrl(url: string): boolean {
    if (!url) return false;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();

    return imageExtensions.some((ext) => lowerUrl.includes(ext));
  }

  /**
   * get a fallback image URL if the provided url is invalid
   * @param imageUrl - original image url
   * @param fallback - fallback url (optional)
   * @returns valid image url or fallback
   */
  static getValidImageUrl(
    imageUrl?: string,
    fallback?: string
  ): string | undefined {
    if (imageUrl && this.isImageUrl(imageUrl)) {
      return imageUrl;
    }
    return fallback;
  }

  /**
   * download a file from url
   * @param url - file url
   * @param filename - suggested filename
   */
  static downloadFile(url: string, filename?: string): void {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;

    if (filename) {
      link.download = filename;
    } else {
      // extract filename from url
      const urlParts = url.split('/');
      link.download = urlParts[urlParts.length - 1] || 'download';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// array and data manipulation utilities
export class DataUtils {
  /**
   * group episodes by date/period
   * @param episodes - episodes to group
   * @param period - grouping period ('year', 'month', 'week')
   * @returns grouped episodes
   */
  static groupEpisodesByPeriod(
    episodes: any[],
    period: 'year' | 'month' | 'week' = 'month'
  ): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    episodes.forEach((episode) => {
      if (!episode.publishDate) return;

      const date = new Date(episode.publishDate);
      let key: string;

      switch (period) {
        case 'year':
          key = date.getFullYear().toString();
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = DateUtils.formatDate(weekStart, 'short');
          break;
        case 'month':
        default:
          key = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          });
          break;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(episode);
    });

    return grouped;
  }

  /**
   * sort episodes by date (newest first by default)
   * @param episodes - episodes to sort
   * @param ascending - sort order (false = newest first)
   * @returns sorted episodes
   */
  static sortEpisodesByDate(
    episodes: any[],
    ascending: boolean = false
  ): any[] {
    return [...episodes].sort((a, b) => {
      const dateA = new Date(a.publishDate || 0).getTime();
      const dateB = new Date(b.publishDate || 0).getTime();

      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}
