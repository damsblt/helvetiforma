/**
 * Clean and optimize WordPress content for display
 * @param html - The HTML content from WordPress
 * @returns Cleaned HTML content
 */
export function cleanWordPressContent(html: string): string {
  if (typeof html !== 'string') {
    return html;
  }

  // Remove WordPress-specific attributes that might cause issues
  let cleaned = html
    // Convert WordPress image URLs to use our proxy
    .replace(/src="https:\/\/(?:api|cms)\.helvetiforma\.ch\/wp-content\/uploads\/([^"]+)"/g, (match, path) => {
      const fullUrl = `https://api.helvetiforma.ch/wp-content/uploads/${path}`;
      return `src="/api/proxy-image?url=${encodeURIComponent(fullUrl)}"`;
    })
    // Convert srcset URLs to use our proxy
    .replace(/srcset="([^"]*)"/g, (match, srcset) => {
      // Split srcset by comma and process each URL individually
      const srcsetParts = srcset.split(',').map((part: string) => {
        const trimmedPart = part.trim();
        // Check if this part contains a WordPress URL
        if (trimmedPart.includes('https://api.helvetiforma.ch/wp-content/uploads/') || 
            trimmedPart.includes('https://cms.helvetiforma.ch/wp-content/uploads/')) {
          // Extract URL and size descriptor
          const urlMatch = trimmedPart.match(/(https:\/\/(?:api|cms)\.helvetiforma\.ch\/wp-content\/uploads\/[^\s]+)/);
          if (urlMatch) {
            const originalUrl = urlMatch[1];
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
            return trimmedPart.replace(originalUrl, proxyUrl);
          }
        }
        return trimmedPart;
      });
      return `srcset="${srcsetParts.join(', ')}"`;
    })
    // Convert file download URLs to use our proxy
    .replace(/href="https:\/\/(?:api|cms)\.helvetiforma\.ch\/wp-content\/uploads\/([^"]+\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar))"/g, (match, path) => {
      const fullUrl = `https://api.helvetiforma.ch/wp-content/uploads/${path}`;
      return `href="/api/proxy-image?url=${encodeURIComponent(fullUrl)}"`;
    });

  // Remove WordPress-specific classes that might conflict
  cleaned = cleaned.replace(/class="[^"]*wp-block-[^"]*"/g, (match) => {
      // Keep the wp-block classes but clean up others
      return match.replace(/class="([^"]*)"/g, (_, classes) => {
        const classList = classes.split(' ').filter((cls: string) => 
          cls.startsWith('wp-block-') || 
          cls === 'has-fixed-layout' ||
          cls === 'has-alpha-channel-opacity' ||
          cls === 'size-large' ||
          cls === 'wp-image-' ||
          cls.startsWith('wp-image-')
        );
        return classList.length > 0 ? `class="${classList.join(' ')}"` : '';
      });
    })
    // Remove WordPress-specific IDs that might cause conflicts
    .replace(/id="[^"]*wp-block-[^"]*"/g, '')
    // Clean up empty class attributes
    .replace(/class=""/g, '')
    // Remove WordPress-specific data attributes
    .replace(/\sdata-[^=]*="[^"]*"/g, '')
    // Ensure proper spacing around blocks
    .replace(/(<\/figure>)(<figure)/g, '$1\n$2')
    .replace(/(<\/div>)(<div)/g, '$1\n$2')
    .replace(/(<\/table>)(<figure)/g, '$1\n$2')
    .replace(/(<\/ul>)(<p)/g, '$1\n$2')
    .replace(/(<\/p>)(<figure)/g, '$1\n$2')
    // Remove all <p> tags (opening and closing) - simple and direct approach
    .replace(/<p[^>]*>/g, '')
    .replace(/<\/p>/g, '')
    // Clean up extra whitespace after removing p tags
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Extract images from WordPress content for preview
 * @param html - The HTML content from WordPress
 * @returns Array of image URLs
 */
export function extractImagesFromContent(html: string): string[] {
  if (typeof html !== 'string') {
    return [];
  }

  const images: string[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && !images.includes(match[1])) {
      images.push(match[1]);
    }
  }

  return images;
}

/**
 * Extract file downloads from WordPress content
 * @param html - The HTML content from WordPress
 * @returns Array of file objects with name and URL
 */
export function extractFilesFromContent(html: string): Array<{ name: string; url: string }> {
  if (typeof html !== 'string') {
    return [];
  }

  const files: Array<{ name: string; url: string }> = [];
  const fileRegex = /<a[^>]+href="([^"]+\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar))"[^>]*>([^<]+)<\/a>/g;
  let match;

  while ((match = fileRegex.exec(html)) !== null) {
    if (match[1] && match[2]) {
      files.push({
        name: match[2].trim(),
        url: match[1]
      });
    }
  }

  return files;
}

/**
 * Get content preview (first paragraph or excerpt)
 * @param html - The HTML content from WordPress
 * @param maxLength - Maximum length of preview
 * @returns Content preview
 */
export function getContentPreview(html: string, maxLength: number = 200): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&[#\w]+;/g, (entity) => {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#8211;': '–',
      '&#8212;': '—',
      '&#8216;': '\u2018',
      '&#8217;': '\u2019',
      '&#8220;': '\u201C',
      '&#8221;': '\u201D',
      '&#8230;': '…',
      '&nbsp;': ' ',
    };
    return entities[entity] || entity;
  });

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }

  return text;
}
