/**
 * Decode HTML entities in a string
 * @param html - The HTML string to decode
 * @returns The decoded string
 */
export function decodeHtmlEntities(html: string): string {
  if (typeof html !== 'string') {
    return html;
  }

  // Create a temporary DOM element to decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}

/**
 * Decode HTML entities in a string (server-side safe version)
 * @param html - The HTML string to decode
 * @returns The decoded string
 */
export function decodeHtmlEntitiesServer(html: string): string {
  if (typeof html !== 'string') {
    return html;
  }

  // Common HTML entities mapping
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#8211;': '–', // en dash
    '&#8212;': '—', // em dash
    '&#8216;': '\u2018', // left single quotation mark
    '&#8217;': '\u2019', // right single quotation mark
    '&#8220;': '\u201C', // left double quotation mark
    '&#8221;': '\u201D', // right double quotation mark
    '&#8230;': '…', // horizontal ellipsis
    '&#8242;': '′', // prime
    '&#8243;': '″', // double prime
    '&#8364;': '€', // euro sign
    '&#8482;': '™', // trademark sign
    '&#169;': '©', // copyright sign
    '&#174;': '®', // registered sign
    '&nbsp;': ' ', // non-breaking space
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&para;': '¶',
    '&middot;': '·',
    '&hellip;': '…',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
  };

  return html.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}
