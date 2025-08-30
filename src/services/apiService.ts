// API Service for Helvetiforma - Supports both Strapi and WordPress with fallback

interface ApiConfig {
  strapiUrl: string;
  wordpressUrl: string;
  useWordPress: boolean;
  fallbackToStrapi: boolean;
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

interface FormationDoc {
  id: number;
  title: string;
  description?: string;
  module: number;
  order: number;
  estimatedDuration?: number;
  isRequired: boolean;
}

class ApiService {
  private config: ApiConfig;

  constructor() {
    this.config = {
      strapiUrl: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
      wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch',
      useWordPress: process.env.NEXT_PUBLIC_USE_WORDPRESS === 'true',
      fallbackToStrapi: process.env.NEXT_PUBLIC_FALLBACK_TO_STRAPI === 'true',
    };
  }

  /**
   * Toggle between WordPress and Strapi
   */
  public toggleApi(useWordPress: boolean) {
    this.config.useWordPress = useWordPress;
    localStorage.setItem('helvetiforma_api_source', useWordPress ? 'wordpress' : 'strapi');
  }

  /**
   * Get current API source
   */
  public getCurrentApiSource(): 'wordpress' | 'strapi' {
    return this.config.useWordPress ? 'wordpress' : 'strapi';
  }

  /**
   * Fetch article by ID
   */
  public async getArticle(id: string): Promise<Article> {
    try {
      if (this.config.useWordPress) {
        return await this.getArticleFromWordPress(id);
      } else {
        return await this.getArticleFromStrapi(id);
      }
    } catch (error) {
      console.error('Primary API failed:', error);
      
      if (this.config.fallbackToStrapi && this.config.useWordPress) {
        console.log('Falling back to Strapi...');
        return await this.getArticleFromStrapi(id);
      }
      
      throw error;
    }
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
    try {
      if (this.config.useWordPress) {
        return await this.getArticlesFromWordPress(filters);
      } else {
        return await this.getArticlesFromStrapi(filters);
      }
    } catch (error) {
      console.error('Primary API failed:', error);
      
      if (this.config.fallbackToStrapi && this.config.useWordPress) {
        console.log('Falling back to Strapi...');
        return await this.getArticlesFromStrapi(filters);
      }
      
      throw error;
    }
  }

  /**
   * WordPress API Methods - Using native post endpoints
   */
  private async getArticleFromWordPress(id: string): Promise<Article> {
    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/wp/v2/posts/${id}`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return WordPress data directly - no transformation needed
    return data;
  }

  private async getArticlesFromWordPress(filters?: {
    search?: string;
    categories?: number[];
    tags?: number[];
    per_page?: number;
  }): Promise<Article[]> {
    const params = new URLSearchParams();
    params.append('per_page', filters?.per_page?.toString() || '100');
    
    // Add search if provided
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    // Add categories if provided
    if (filters?.categories && filters.categories.length > 0) {
      params.append('categories', filters.categories.join(','));
    }
    
    // Add tags if provided
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }

    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/wp/v2/posts?${params}`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return WordPress data directly - no transformation needed
    return data;
  }

  /**
   * Strapi API Methods (legacy support)
   */
  private async getArticleFromStrapi(id: string): Promise<Article> {
    const response = await fetch(
      `${this.config.strapiUrl}/api/formations/${id}?populate[modules][populate]=*&populate[sessions]=*`
    );

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error('Article not found');
    }

    // Transform Strapi data to match Article interface
    return {
      id: data.data.id,
      title: { rendered: data.data.attributes.Title || '' },
      content: { rendered: data.data.attributes.Description || '' },
      excerpt: { rendered: data.data.attributes.Description || '' },
      slug: `formation-${data.data.id}`,
      date: data.data.attributes.createdAt || new Date().toISOString(),
      modified: data.data.attributes.updatedAt || new Date().toISOString(),
      author: 1,
      featured_media: 0,
      comment_status: 'open',
      ping_status: 'open',
      sticky: false,
      template: '',
      format: 'standard',
      meta: {},
      categories: [],
      tags: [],
      link: `${this.config.strapiUrl}/formations/${data.data.id}`,
      guid: { rendered: `${this.config.strapiUrl}/formations/${data.data.id}` },
      status: 'publish',
      type: 'post'
    };
  }

  private async getArticlesFromStrapi(filters?: any): Promise<Article[]> {
    const params = new URLSearchParams();
    params.append('populate', '*');
    
    if (filters?.search) {
      params.append('filters[Title][$containsi]', filters.search);
    }

    const response = await fetch(
      `${this.config.strapiUrl}/api/formations?${params}`
    );

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Strapi data to match Article interface
    return (data.data || []).map((item: any) => ({
      id: item.id,
      title: { rendered: item.attributes.Title || '' },
      content: { rendered: item.attributes.Description || '' },
      excerpt: { rendered: item.attributes.Description || '' },
      slug: `formation-${item.id}`,
      date: item.attributes.createdAt || new Date().toISOString(),
      modified: item.attributes.updatedAt || new Date().toISOString(),
      author: 1,
      featured_media: 0,
      comment_status: 'open',
      ping_status: 'open',
      sticky: false,
      template: '',
      format: 'standard',
      meta: {},
      categories: [],
      tags: [],
      link: `${this.config.strapiUrl}/formations/${item.id}`,
      guid: { rendered: `${this.config.strapiUrl}/formations/${item.id}` },
      status: 'publish',
      type: 'post'
    }));
  }

  /**
   * Health check for both APIs
   */
  public async checkApiHealth(): Promise<{
    wordpress: boolean;
    strapi: boolean;
  }> {
    const results = await Promise.allSettled([
      this.checkWordPressHealth(),
      this.checkStrapiHealth(),
    ]);

    return {
      wordpress: results[0].status === 'fulfilled',
      strapi: results[1].status === 'fulfilled',
    };
  }

  private async checkWordPressHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.wordpressUrl}/wp-json/wp/v2/posts`,
        { method: 'HEAD' }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkStrapiHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.strapiUrl}/api/formations`,
        { method: 'HEAD' }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get WordPress categories and tags for filtering
   */
  public async getWordPressCategories(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.wordpressUrl}/wp-json/wp/v2/categories`
      );
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch WordPress categories:', error);
      return [];
    }
  }

  public async getWordPressTags(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.wordpressUrl}/wp-json/wp/v2/tags`
      );
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch WordPress tags:', error);
      return [];
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
