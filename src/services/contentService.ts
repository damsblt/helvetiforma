// Content management service for website text editing
export interface WebsiteContent {
  // Hero Section
  heroTitle: string;
  heroDescription: string;
  
  // About Section
  aboutTitle: string;
  aboutContent: string;
  aboutSubContent: string;
  
  // Features Section
  featuresTitle: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  
  // Stats Section
  statsTitle: string;
  statsSubtitle: string;
  statsLearners: string;
  statsFormations: string;
  statsSatisfaction: string;
  statsSupport: string;
  
  // CTA Section
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton1: string;
  ctaButton2: string;
  
  // Formations
  formationSalairesTitle: string;
  formationSalairesDescription: string;
  formationSalairesOverview: string;
  formationSalairesDay1: string;
  formationSalairesDay2: string;
  formationSalairesDay3: string;
  formationSalairesTargetAudience: string;
  formationSalairesPrerequisites: string;
  
  formationChargesTitle: string;
  formationChargesDescription: string;
  formationChargesOverview: string;
  formationChargesTargetAudience: string;
  formationChargesPrerequisites: string;
  
  formationImpotTitle: string;
  formationImpotDescription: string;
  formationImpotOverview: string;
  formationImpotTargetAudience: string;
  formationImpotPrerequisites: string;
  
  // Formation Details
  formationDuration: string;
  formationMaxParticipants: string;
  formationPrice: string;
  formationLevel: string;
  
  // Contact Section
  contactTitle: string;
  contactDescription: string;
  
  // Contact Information
  contactEmail: string;
  contactLocation: string;
  contactResponseTime: string;
  
  // Why Choose Us
  whyChooseUsTitle: string;
  whyChooseUsPoint1: string;
  whyChooseUsPoint2: string;
  whyChooseUsPoint3: string;
  
  // FAQ Section
  faqTitle: string;
  faqQuestion1: string;
  faqAnswer1: string;
  faqQuestion2: string;
  faqAnswer2: string;
  faqQuestion3: string;
  faqAnswer3: string;
  faqQuestion4: string;
  faqAnswer4: string;
  
  // Concept Section
  conceptTitle: string;
  conceptSubtitle: string;
  conceptContent: string;
  conceptBlendedLearningTitle: string;
  conceptBlendedLearningDescription: string;
  conceptFeatures: string;
}

// Default content values
const defaultContent: WebsiteContent = {
  heroTitle: 'Bienvenue sur <span class="text-blue-400">HelvetiForma</span>',
  heroDescription: 'Votre plateforme de formation professionnelle en Suisse. Découvrez nos formations spécialisées et développez vos compétences avec une approche moderne et flexible.',
  
  aboutTitle: 'Une approche moderne de la formation',
  aboutContent: 'HelvetiForma révolutionne l\'apprentissage professionnel en combinant la flexibilité du digital avec l\'efficacité de l\'enseignement traditionnel.',
  aboutSubContent: 'Notre plateforme vous offre un accès à des ressources de qualité, des modules interactifs et un suivi personnalisé pour maximiser vos chances de réussite.',
  
  featuresTitle: 'Pourquoi choisir HelvetiForma ?',
  feature1Title: 'Formations Certifiantes',
  feature1Description: 'Nos programmes délivrent des certificats reconnus qui attestent de vos compétences acquises et valorisent votre CV.',
  feature2Title: 'Apprentissage Flexible',
  feature2Description: 'Combinez cours en ligne et sessions en présentiel selon vos disponibilités. Apprenez à votre rythme, où et quand vous voulez.',
  feature3Title: 'Support Personnalisé',
  feature3Description: 'Bénéficiez d\'un accompagnement sur mesure avec nos formateurs experts et notre équipe dédiée à votre réussite.',
  
  statsTitle: 'Nos chiffres parlent d\'eux-mêmes',
  statsSubtitle: 'Une croissance constante et des résultats probants',
  statsLearners: '500+',
  statsFormations: '50+',
  statsSatisfaction: '95%',
  statsSupport: '24/7',
  
  ctaTitle: 'Prêt à développer vos compétences ?',
  ctaSubtitle: 'Rejoignez des centaines de professionnels qui ont déjà choisi HelvetiForma pour leur formation continue.',
  ctaButton1: 'Consulter nos ressources',
  ctaButton2: 'Nous contacter',
  
  // Formation Salaires
  formationSalairesTitle: 'Formation Salaires',
  formationSalairesDescription: 'Formation complète sur la gestion des salaires en Suisse',
  formationSalairesOverview: 'Cette formation intensive de 3 jours vous permettra de maîtriser tous les aspects de la gestion des salaires en Suisse, de la conformité légale aux outils pratiques de gestion RH.',
  formationSalairesDay1: '• Cadre légal suisse et obligations de l\'employeur\n• Structure des salaires et composantes\n• Calcul des salaires de base et variables\n• Gestion des heures supplémentaires et du travail de nuit',
  formationSalairesDay2: '• Gestion des congés et absences\n• Calcul des indemnités et avantages\n• Gestion des primes et bonus\n• Outils de gestion RH et logiciels',
  formationSalairesDay3: '• Déclarations sociales et fiscales\n• Contrôles et audits\n• Bonnes pratiques et optimisation\n• Cas pratiques et mise en situation',
  formationSalairesTargetAudience: 'Responsables RH\nComptables et contrôleurs\nGestionnaires de paie\nChefs d\'entreprise\nConsultants en ressources humaines',
  formationSalairesPrerequisites: 'Connaissances de base en comptabilité\nExpérience en gestion d\'entreprise\nMaîtrise du français\nOrdinateur portable (recommandé)',
  
  // Formation Charges Sociales
  formationChargesTitle: 'Charges Sociales',
  formationChargesDescription: 'Formation sur les charges sociales et assurances en Suisse',
  formationChargesOverview: 'Formation complète sur la gestion des charges sociales et assurances en Suisse.',
  formationChargesTargetAudience: 'Responsables RH\nComptables\nGestionnaires de paie\nChefs d\'entreprise',
  formationChargesPrerequisites: 'Connaissances de base en comptabilité\nExpérience en gestion d\'entreprise\nMaîtrise du français',
  
  // Formation Impôt à la Source
  formationImpotTitle: 'Impôt à la Source',
  formationImpotDescription: 'Formation sur l\'impôt à la source en Suisse',
  formationImpotOverview: 'Formation complète sur l\'impôt à la source en Suisse.',
  formationImpotTargetAudience: 'Responsables RH\nComptables\nGestionnaires de paie\nChefs d\'entreprise',
  formationImpotPrerequisites: 'Connaissances de base en comptabilité\nExpérience en gestion d\'entreprise\nMaîtrise du français',
  
  // Formation Details
  formationDuration: '3 jours',
  formationMaxParticipants: 'Max 12 participants',
  formationPrice: 'CHF 1,200',
  formationLevel: 'Niveau Intermédiaire',
  
  contactTitle: 'Contactez-nous',
  contactDescription: 'N\'hésitez pas à nous contacter pour plus d\'informations sur nos formations.',
  
  // Contact Information
  contactEmail: 'info@helvetiforma.ch',
  contactLocation: 'Suisse',
  contactResponseTime: 'Sous 24-48 heures',
  
  // Why Choose Us
  whyChooseUsTitle: 'Pourquoi nous choisir ?',
  whyChooseUsPoint1: 'Formations certifiantes',
  whyChooseUsPoint2: 'Support personnalisé',
  whyChooseUsPoint3: 'Flexibilité d\'apprentissage',
  
  // FAQ Section
  faqTitle: 'Questions fréquentes',
  faqQuestion1: 'Comment s\'inscrire à une formation ?',
  faqAnswer1: 'Contactez-nous via ce formulaire ou par email. Nous vous guiderons dans le processus d\'inscription et répondrons à toutes vos questions.',
  faqQuestion2: 'Les formations sont-elles certifiantes ?',
  faqAnswer2: 'Oui, nos formations délivrent des certificats reconnus qui attestent de vos compétences acquises.',
  faqQuestion3: 'Quels sont les délais de réponse ?',
  faqAnswer3: 'Nous nous engageons à répondre à toutes les demandes sous 24-48 heures maximum.',
  faqQuestion4: 'Proposez-vous des formations sur mesure ?',
  faqAnswer4: 'Absolument ! Nous adaptons nos programmes aux besoins spécifiques de votre entreprise ou organisation.',
  
  conceptTitle: 'Notre Concept',
  conceptSubtitle: 'Une approche innovante pour votre formation',
  conceptContent: 'HelvetiForma est une plateforme de formation en ligne qui vous offre la liberté d\'apprendre à votre rythme, où et quand vous voulez. Nous vous aidons à acquérir les compétences nécessaires pour réussir dans votre carrière.',
  conceptBlendedLearningTitle: 'Apprentissage hybride (Blended Learning)',
  conceptBlendedLearningDescription: 'Notre approche révolutionne la formation en combinant deux modalités d\'apprentissage :',
  conceptFeatures: 'Nos avantages : Flexibilité, Accessibilité, Suivi Personnalisé, Support 24/7'
};

class ContentService {
  private content: WebsiteContent;
  private isLoaded: boolean = false;
  
  constructor() {
    this.content = { ...defaultContent };
    this.loadContent();
  }
  
  // Load content from server API or localStorage fallback
  private async loadContent(): Promise<void> {
    try {
      // Try to load from server first
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          this.content = { ...defaultContent, ...data.content };
          this.isLoaded = true;
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load content from server, trying localStorage:', error);
    }
    
    // Fallback to localStorage
    try {
      if (typeof window !== 'undefined') {
        const savedContent = localStorage.getItem('websiteContent');
        if (savedContent) {
          const parsed = JSON.parse(savedContent);
          this.content = { ...defaultContent, ...parsed };
        }
      }
    } catch (error) {
      console.error('Error loading content from localStorage:', error);
    }
    
    this.isLoaded = true;
  }
  
  // Refresh content from server
  async refreshContent(): Promise<void> {
    await this.loadContent();
  }

  // Get all content
  getContent(): WebsiteContent {
    return { ...this.content };
  }
  
  // Check if content is loaded
  isContentLoaded(): boolean {
    return this.isLoaded;
  }
  
  // Get specific content field
  getField<K extends keyof WebsiteContent>(field: K): WebsiteContent[K] {
    return this.content[field];
  }
  
  // Update specific content field
  async updateField<K extends keyof WebsiteContent>(field: K, value: WebsiteContent[K]): Promise<void> {
    this.content[field] = value;
    await this.saveContent();
  }
  
  // Update multiple content fields
  async updateFields(updates: Partial<WebsiteContent>): Promise<void> {
    this.content = { ...this.content, ...updates };
    await this.saveContent();
  }
  
  // Save content to server and localStorage
  private async saveContent(): Promise<void> {
    try {
      // Save to server
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: this.content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content to server');
      }
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('websiteContent', JSON.stringify(this.content));
      }
    } catch (error) {
      console.error('Error saving content:', error);
      
      // Fallback to localStorage only
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('websiteContent', JSON.stringify(this.content));
        }
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  }
  
  // Reset content to defaults
  async resetToDefaults(): Promise<void> {
    this.content = { ...defaultContent };
    await this.saveContent();
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
