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
  Type: string;
  Theme: string;
  totalModules?: number;
  estimatedDuration?: number;
  difficulty?: string;
  price?: number;
  modules?: FormationDoc[];
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
      wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://yourdomain.com',
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
   * WordPress API Methods
   */
  private async getFormationFromWordPress(id: string): Promise<Formation> {
    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/helvetiforma/v1/formations/${id}`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform WordPress data to match Strapi format
    return {
      id: data.id,
      Title: data.Title,
      Description: data.Description,
      Type: data.Type,
      Theme: data.Theme,
      totalModules: data.total_modules,
      estimatedDuration: data.estimated_duration,
      difficulty: data.difficulty,
      modules: data.modules?.map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        module: module.module,
        order: module.order,
        estimatedDuration: module.estimatedDuration,
        isRequired: module.isRequired,
      })),
    };
  }

  private async getFormationsFromWordPress(filters?: {
    theme?: string;
    type?: string;
    difficulty?: string;
  }): Promise<Formation[]> {
    const params = new URLSearchParams();
    
    if (filters?.theme) params.append('theme', filters.theme);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);

    const response = await fetch(
      `${this.config.wordpressUrl}/wp-json/helvetiforma/v1/formations?${params}`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform WordPress data to match Strapi format
    return data.map((formation: any) => ({
      id: formation.id,
      Title: formation.Title,
      Description: formation.Description,
      Type: formation.Type,
      Theme: formation.Theme,
      totalModules: formation.total_modules,
      estimatedDuration: formation.estimated_duration,
      difficulty: formation.difficulty,
    }));
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
        `${this.config.wordpressUrl}/wp-json/wp/v2/`,
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
   * Migrate data from Strapi to WordPress
   */
  public async migrateFormationToWordPress(strapiId: string): Promise<boolean> {
    try {
      // Get formation from Strapi
      const formation = await this.getFormationFromStrapi(strapiId);
      
      // Create formation in WordPress via REST API
      const response = await fetch(
        `${this.config.wordpressUrl}/wp-json/wp/v2/formation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WORDPRESS_TOKEN}`,
          },
          body: JSON.stringify({
            title: formation.Title,
            content: formation.Description,
            excerpt: formation.Description,
            status: 'publish',
            meta: {
              _estimated_duration: formation.estimatedDuration,
              _total_modules: formation.totalModules,
              _price: formation.price,
              _formation_id: strapiId, // Keep reference to Strapi ID
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Migration failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
