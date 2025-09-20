// API Service for Helvetiforma - WordPress only

interface ApiConfig {
  wordpressUrl: string;
}

interface Article {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any;
  categories: number[];
  tags: number[];
  // WordPress specific fields
  _embedded?: any;
  link: string;
  guid: any;
  status: string;
  type: string;
}

class ApiService {
  private config: ApiConfig;

  constructor() {
    this.config = {
      wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch',
    };
  }

  /**
   * Fetch article by ID
   */
  public async getArticle(id: string): Promise<Article> {
    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/wp/v2/posts/${id}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Fetch all articles
   */
  public async getArticles(filters?: {
    search?: string;
    categories?: number[];
    tags?: number[];
    per_page?: number;
  }): Promise<Article[]> {
    let url = `${this.config.wordpressUrl}/wp-json/wp/v2/posts`;
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    if (filters?.categories && filters.categories.length > 0) {
      params.append('categories', filters.categories.join(','));
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    
    if (filters?.per_page) {
      params.append('per_page', filters.per_page.toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Check API health
   */
  public async checkApiHealth(): Promise<{ wordpress: boolean }> {
    try {
      const response = await fetch(`${this.config.wordpressUrl}/wp-json/wp/v2/posts?per_page=1`);
      return {
        wordpress: response.ok
      };
    } catch (error) {
      return {
        wordpress: false
      };
    }
  }
}

export default new ApiService();