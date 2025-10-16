/**
 * Utility functions for the HelvetiForma application
 */

/**
 * Strips HTML tags from a string and returns clean text
 * @param html - The HTML string to clean
 * @returns Clean text without HTML tags
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Strips HTML tags and truncates text for article excerpts
 * @param content - The HTML content to process
 * @param maxLength - Maximum length before truncation
 * @returns Clean, truncated text
 */
export function cleanExcerpt(content: string | null | undefined, maxLength: number = 150): string {
  const cleanText = stripHtmlTags(content);
  return truncateText(cleanText, maxLength);
}
