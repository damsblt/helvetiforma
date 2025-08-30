// API Service for Helvetiforma - Supports both Strapi and WordPress with fallback

interface ApiConfig {
  strapiUrl: string;
  wordpressUrl: string;
  useWordPress: boolean;
  fallbackToStrapi: boolean;
}

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type?: string;
  Theme?: string;
  totalModules?: number;
  estimatedDuration?: number;
  difficulty?: string;
  price?: number;
  modules?: FormationDoc[];
  slug?: string;
  date?: string;
  excerpt?: string;
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
   * Fetch formation by ID
   */
  public async getFormation(id: string): Promise<Formation> {
    try {
      if (this.config.useWordPress) {
        return await this.getFormationFromWordPress(id);
      } else {
        return await this.getFormationFromStrapi(id);
      }
    } catch (error) {
      console.error('Primary API failed:', error);
      
      if (this.config.fallbackToStrapi && this.config.useWordPress) {
        console.log('Falling back to Strapi...');
        return await this.getFormationFromStrapi(id);
      }
      
      throw error;
    }
  }

  /**
   * Fetch all formations
   */
  public async getFormations(filters?: {
    theme?: string;
    type?: string;
    difficulty?: string;
  }): Promise<Formation[]> {
    try {
      if (this.config.useWordPress) {
        return await this.getFormationsFromWordPress(filters);
      } else {
        return await this.getFormationsFromStrapi(filters);
      }
    } catch (error) {
      console.error('Primary API failed:', error);
      
      if (this.config.fallbackToStrapi && this.config.useWordPress) {
        console.log('Falling back to Strapi...');
        return await this.getFormationsFromStrapi(filters);
      }
      
      throw error;
    }
  }

  /**
   * WordPress API Methods - Using native post endpoints
   */
  private async getFormationFromWordPress(id: string): Promise<Formation> {
    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/wp/v2/posts/${id}`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform WordPress post data to match Formation format
    return {
      id: data.id,
      Title: data.title.rendered || data.title,
      Description: data.content.rendered || data.content,
      excerpt: data.excerpt.rendered || data.excerpt,
      slug: data.slug,
      date: data.date,
      // Use default values to avoid type issues
      Type: 'Formation',
      Theme: 'General',
      difficulty: 'Beginner',
      estimatedDuration: 0,
      totalModules: 0,
      price: 0,
    };
  }

  private async getFormationsFromWordPress(filters?: {
    theme?: string;
    type?: string;
    difficulty?: string;
  }): Promise<Formation[]> {
    const params = new URLSearchParams();
    params.append('per_page', '100'); // Get more posts
    
    // Add search if filters are provided
    if (filters?.theme || filters?.type || filters?.difficulty) {
      const searchTerms = [];
      if (filters.theme) searchTerms.push(filters.theme);
      if (filters.type) searchTerms.push(filters.type);
      if (filters.difficulty) searchTerms.push(filters.difficulty);
      params.append('search', searchTerms.join(' '));
    }

    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/wp/v2/posts?${params}`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform WordPress posts to Formation format
    return data.map((post: any) => ({
      id: post.id,
      Title: post.title.rendered || post.title,
      Description: post.excerpt.rendered || post.excerpt,
      excerpt: post.excerpt.rendered || post.excerpt,
      slug: post.slug,
      date: post.date,
      // Use default values to avoid type issues
      Type: 'Formation',
      Theme: 'General',
      difficulty: 'Beginner',
      estimatedDuration: 0,
      totalModules: 0,
      price: 0,
    }));
  }

  /**
   * Extract metadata from WordPress post content
   * Looks for patterns like [Type: Formation] or [Theme: Business]
   */
  private extractMetadata(content: string, key: string): string | number | null {
    if (!content) return null;
    
    const regex = new RegExp(`\\[${key}:\\s*([^\\]]+)\\]`, 'i');
    const match = content.match(regex);
    
    if (match && match[1]) {
      const value = match[1].trim();
      // Try to convert to number if it's numeric
      if (!isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }
    
    return null;
  }

  /**
   * Strapi API Methods (existing)
   */
  private async getFormationFromStrapi(id: string): Promise<Formation> {
    const response = await fetch(
      `${this.config.strapiUrl}/api/formations/${id}?populate[modules][populate]=*&populate[sessions]=*`
    );

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error('Formation not found');
    }

    return data.data;
  }

  private async getFormationsFromStrapi(filters?: {
    theme?: string;
    type?: string;
    difficulty?: string;
  }): Promise<Formation[]> {
    const params = new URLSearchParams();
    params.append('populate', '*');
    
    if (filters?.theme) params.append('filters[Theme][$eq]', filters.theme);
    if (filters?.type) params.append('filters[Type][$eq]', filters.type);
    if (filters?.difficulty) params.append('filters[difficulty][$eq]', filters.difficulty);

    const response = await fetch(
      `${this.config.strapiUrl}/api/formations?${params}`
    );

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
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
