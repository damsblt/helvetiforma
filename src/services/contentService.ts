// Content management service for website text editing
export interface WebsiteContent {
  // Hero Section
  heroTitle: string;
  heroDescription: string;
  
  // About Section
  aboutTitle: string;
  aboutContent: string;
  
  // Features Section
  featuresTitle: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  
  // Formations
  formationSalairesTitle: string;
  formationSalairesDescription: string;
  formationChargesTitle: string;
  formationChargesDescription: string;
  formationImpotTitle: string;
  formationImpotDescription: string;
  
  // Contact Section
  contactTitle: string;
  contactDescription: string;
}

// Default content values
const defaultContent: WebsiteContent = {
  heroTitle: 'Bienvenue sur <span class="text-blue-400">Helvetiforma</span>',
  heroDescription: 'Votre plateforme de formation professionnelle en Suisse. Découvrez nos formations spécialisées et développez vos compétences avec une approche moderne et flexible.',
  
  aboutTitle: 'Une approche moderne de la formation',
  aboutContent: 'Helvetiforma révolutionne l\'apprentissage professionnel en combinant la flexibilité du digital avec l\'efficacité de l\'enseignement traditionnel.',
  
  featuresTitle: 'Pourquoi choisir Helvetiforma ?',
  feature1Title: 'Formations Certifiantes',
  feature1Description: 'Nos programmes délivrent des certificats reconnus qui attestent de vos compétences acquises et valorisent votre CV.',
  feature2Title: 'Apprentissage Flexible',
  feature2Description: 'Combinez cours en ligne et sessions en présentiel selon vos disponibilités. Apprenez à votre rythme, où et quand vous voulez.',
  feature3Title: 'Support Personnalisé',
  feature3Description: 'Bénéficiez d\'un accompagnement sur mesure avec nos formateurs experts et notre équipe dédiée à votre réussite.',
  
  formationSalairesTitle: 'Formation Salaires',
  formationSalairesDescription: 'Formation complète sur la gestion des salaires en Suisse',
  formationChargesTitle: 'Charges Sociales',
  formationChargesDescription: 'Formation sur les charges sociales et assurances en Suisse',
  formationImpotTitle: 'Impôt à la Source',
  formationImpotDescription: 'Formation sur l\'impôt à la source en Suisse',
  
  contactTitle: 'Contactez-nous',
  contactDescription: 'N\'hésitez pas à nous contacter pour plus d\'informations sur nos formations.'
};

class ContentService {
  private content: WebsiteContent;
  
  constructor() {
    this.content = this.loadContent();
  }
  
  // Load content from localStorage or use defaults
  private loadContent(): WebsiteContent {
    try {
      const savedContent = localStorage.getItem('websiteContent');
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        return { ...defaultContent, ...parsed };
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
    return { ...defaultContent };
  }
  
  // Get all content
  getContent(): WebsiteContent {
    return { ...this.content };
  }
  
  // Get specific content field
  getField<K extends keyof WebsiteContent>(field: K): WebsiteContent[K] {
    return this.content[field];
  }
  
  // Update specific content field
  updateField<K extends keyof WebsiteContent>(field: K, value: WebsiteContent[K]): void {
    this.content[field] = value;
    this.saveContent();
  }
  
  // Update multiple content fields
  updateFields(updates: Partial<WebsiteContent>): void {
    this.content = { ...this.content, ...updates };
    this.saveContent();
  }
  
  // Save content to localStorage
  private saveContent(): void {
    try {
      localStorage.setItem('websiteContent', JSON.stringify(this.content));
    } catch (error) {
      console.error('Error saving content:', error);
    }
  }
  
  // Reset content to defaults
  resetToDefaults(): void {
    this.content = { ...defaultContent };
    this.saveContent();
  }
  
  // Export content as JSON
  exportContent(): string {
    return JSON.stringify(this.content, null, 2);
  }
  
  // Import content from JSON
  importContent(jsonContent: string): boolean {
    try {
      const parsed = JSON.parse(jsonContent);
      this.content = { ...defaultContent, ...parsed };
      this.saveContent();
      return true;
    } catch (error) {
      console.error('Error importing content:', error);
      return false;
    }
  }
}

// Export singleton instance
export const contentService = new ContentService();
