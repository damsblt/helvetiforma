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
  formationSalairesDuration: string;
  formationSalairesPrice: string;
  formationSalairesLevel: string;
  formationSalairesParticipants: string;
  formationSalairesKeyConcept1Title: string;
  formationSalairesKeyConcept1Description: string;
  formationSalairesKeyConcept2Title: string;
  formationSalairesKeyConcept2Description: string;
  formationSalairesKeyConcept3Title: string;
  formationSalairesKeyConcept3Description: string;
  formationSalairesKeyConcept4Title: string;
  formationSalairesKeyConcept4Description: string;
  formationSalairesCtaTitle: string;
  formationSalairesCtaDescription: string;
  formationSalairesObjectives: string;
  formationSalairesIncluded: string;
  
  formationChargesTitle: string;
  formationChargesDescription: string;
  formationChargesOverview: string;
  formationChargesTargetAudience: string;
  formationChargesPrerequisites: string;
  formationChargesKeyConcept1Title: string;
  formationChargesKeyConcept1Description: string;
  formationChargesKeyConcept2Title: string;
  formationChargesKeyConcept2Description: string;
  formationChargesKeyConcept3Title: string;
  formationChargesKeyConcept3Description: string;
  formationChargesKeyConcept4Title: string;
  formationChargesKeyConcept4Description: string;
  formationChargesCtaTitle: string;
  formationChargesCtaDescription: string;
  formationChargesObjectives: string;
  formationChargesIncluded: string;
  formationChargesDuration: string;
  formationChargesPrice: string;
  
  formationImpotTitle: string;
  formationImpotDescription: string;
  formationImpotOverview: string;
  formationImpotTargetAudience: string;
  formationImpotPrerequisites: string;
  formationImpotKeyConcept1Title: string;
  formationImpotKeyConcept1Description: string;
  formationImpotKeyConcept2Title: string;
  formationImpotKeyConcept2Description: string;
  formationImpotKeyConcept3Title: string;
  formationImpotKeyConcept3Description: string;
  formationImpotKeyConcept4Title: string;
  formationImpotKeyConcept4Description: string;
  formationImpotCtaTitle: string;
  formationImpotCtaDescription: string;
  formationImpotObjectives: string;
  formationImpotIncluded: string;
  formationImpotDuration: string;
  formationImpotPrice: string;
  formationImpotLevel: string;
  formationImpotParticipants: string;
  
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

  // Formation Card Fields - Salaires
  formationSalairesIcon: string;
  formationSalairesCardTitle: string;
  formationSalairesCardDescription: string;
  formationSalairesCardDuration: string;
  formationSalairesCardLevel: string;
  formationSalairesCardPrice: string;
  formationSalairesFeature1: string;
  formationSalairesFeature2: string;
  formationSalairesFeature3: string;
  formationSalairesFeature4: string;

  // Formation Card Fields - Charges Sociales
  formationChargesSocialesIcon: string;
  formationChargesSocialesCardTitle: string;
  formationChargesSocialesCardDescription: string;
  formationChargesSocialesCardDuration: string;
  formationChargesSocialesCardLevel: string;
  formationChargesSocialesCardPrice: string;
  formationChargesSocialesFeature1: string;
  formationChargesSocialesFeature2: string;
  formationChargesSocialesFeature3: string;
  formationChargesSocialesFeature4: string;

  // Formation Card Fields - Impôt à la Source
  formationImpotALaSourceIcon: string;
  formationImpotALaSourceCardTitle: string;
  formationImpotALaSourceCardDescription: string;
  formationImpotALaSourceCardDuration: string;
  formationImpotALaSourceCardLevel: string;
  formationImpotALaSourceCardPrice: string;
  formationImpotALaSourceFeature1: string;
  formationImpotALaSourceFeature2: string;
  formationImpotALaSourceFeature3: string;
  formationImpotALaSourceFeature4: string;
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
  formationSalairesDuration: '3 jours',
  formationSalairesPrice: 'CHF 1,200',
  formationSalairesLevel: 'Niveau Intermédiaire',
  formationSalairesParticipants: 'Max 12 participants',
  formationSalairesKeyConcept1Title: 'Cadre légal',
  formationSalairesKeyConcept1Description: 'Comprendre les obligations légales et les réglementations suisses en matière de salaires.',
  formationSalairesKeyConcept2Title: 'Calcul des salaires',
  formationSalairesKeyConcept2Description: 'Maîtriser les différents types de salaires et leurs calculs spécifiques.',
  formationSalairesKeyConcept3Title: 'Gestion RH',
  formationSalairesKeyConcept3Description: 'Outils et processus de gestion des ressources humaines et de la paie.',
  formationSalairesKeyConcept4Title: 'Déclarations',
  formationSalairesKeyConcept4Description: 'Procédures de déclaration et de conformité fiscale et sociale.',
  formationSalairesCtaTitle: 'Prêt à maîtriser la gestion des salaires ?',
  formationSalairesCtaDescription: 'Inscrivez-vous dès maintenant à notre formation spécialisée.',
  formationSalairesObjectives: '• Maîtriser la gestion des salaires en Suisse\n• Comprendre le cadre légal et les obligations\n• Utiliser les outils de gestion RH\n• Optimiser les processus de paie',
  formationSalairesIncluded: '• Formation de 3 jours\n• Support de cours complet\n• Cas pratiques et exercices\n• Certificat de participation\n• Support post-formation',
  
  // Formation Charges Sociales
  formationChargesTitle: 'Charges Sociales',
  formationChargesDescription: 'Formation sur les charges sociales et assurances en Suisse',
  formationChargesOverview: 'Formation complète sur la gestion des charges sociales et assurances en Suisse.',
  formationChargesTargetAudience: 'Responsables RH\nComptables\nGestionnaires de paie\nChefs d\'entreprise',
  formationChargesPrerequisites: 'Connaissances de base en comptabilité\nExpérience en gestion d\'entreprise\nMaîtrise du français',
  formationChargesKeyConcept1Title: 'AVS/AI/APG',
  formationChargesKeyConcept1Description: 'Comprendre les cotisations pour l\'assurance-vieillesse et survivants, l\'assurance-invalidité et l\'assurance-chômage.',
  formationChargesKeyConcept2Title: 'AC/APL',
  formationChargesKeyConcept2Description: 'Gestion des cotisations pour l\'assurance-accidents et l\'assurance perte de gains.',
  formationChargesKeyConcept3Title: 'LPP',
  formationChargesKeyConcept3Description: 'Prévoyance professionnelle et cotisations obligatoires pour la retraite.',
  formationChargesKeyConcept4Title: 'Déclarations',
  formationChargesKeyConcept4Description: 'Procédures de déclaration et de versement des cotisations sociales.',
  formationChargesCtaTitle: 'Prêt à maîtriser les charges sociales ?',
  formationChargesCtaDescription: 'Inscrivez-vous dès maintenant à notre formation spécialisée.',
  formationChargesObjectives: '• Comprendre le système de charges sociales suisse\n• Maîtriser le calcul des cotisations\n• Gérer les déclarations et versements\n• Optimiser la gestion RH',
  formationChargesIncluded: '• Formation de 3 jours\n• Support de cours complet\n• Cas pratiques et exercices\n• Certificat de participation\n• Support post-formation',
  formationChargesDuration: '3 jours',
  formationChargesPrice: 'CHF 1,200',
  
  // Formation Impôt à la Source
  formationImpotTitle: 'Impôt à la Source',
  formationImpotDescription: 'Formation sur l\'impôt à la source en Suisse',
  formationImpotOverview: 'Formation complète sur l\'impôt à la source en Suisse.',
  formationImpotTargetAudience: 'Responsables RH\nComptables\nGestionnaires de paie\nChefs d\'entreprise',
  formationImpotPrerequisites: 'Connaissances de base en comptabilité\nExpérience en gestion d\'entreprise\nMaîtrise du français',
  formationImpotKeyConcept1Title: 'Calcul de l\'impôt',
  formationImpotKeyConcept1Description: 'Méthodes de calcul de l\'impôt à la source selon les barèmes fédéraux et cantonaux.',
  formationImpotKeyConcept2Title: 'Déductions',
  formationImpotKeyConcept2Description: 'Déductions sociales et professionnelles applicables au calcul de l\'impôt.',
  formationImpotKeyConcept3Title: 'Déclarations',
  formationImpotKeyConcept3Description: 'Procédures de déclaration et de versement de l\'impôt à la source.',
  formationImpotKeyConcept4Title: 'Contrôles',
  formationImpotKeyConcept4Description: 'Gestion des contrôles fiscaux et des régularisations.',
  formationImpotCtaTitle: 'Maîtrisez l\'impôt à la source',
  formationImpotCtaDescription: 'Formation complète pour une gestion optimale de l\'impôt à la source.',
  formationImpotObjectives: '• Maîtriser le calcul de l\'impôt à la source\n• Comprendre les barèmes fédéraux et cantonaux\n• Gérer les déductions et exemptions\n• Optimiser la gestion fiscale',
  formationImpotIncluded: '• Formation de 3 jours\n• Support de cours complet\n• Cas pratiques et exercices\n• Certificat de participation\n• Support post-formation',
  formationImpotDuration: '3 jours',
  formationImpotPrice: 'CHF 1,200',
  formationImpotLevel: 'Niveau Intermédiaire',
  formationImpotParticipants: 'Max 12 participants',
  
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
  conceptFeatures: 'Nos avantages : Flexibilité, Accessibilité, Suivi Personnalisé, Support 24/7',

  // Formation Card Fields - Salaires
  formationSalairesIcon: '💰',
  formationSalairesCardTitle: 'Gestion des Salaires',
  formationSalairesCardDescription: 'Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. Formation pratique avec cas concrets et outils modernes.',
  formationSalairesCardDuration: '3 jours',
  formationSalairesCardLevel: 'Intermédiaire',
  formationSalairesCardPrice: 'CHF 1,200',
  formationSalairesFeature1: 'Calcul des salaires et avantages',
  formationSalairesFeature2: 'Conformité légale suisse',
  formationSalairesFeature3: 'Outils de gestion RH',
  formationSalairesFeature4: 'Gestion des congés et absences',

  // Formation Card Fields - Charges Sociales
  formationChargesSocialesIcon: '🏢',
  formationChargesSocialesCardTitle: 'Charges Sociales & Cotisations',
  formationChargesSocialesCardDescription: 'Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres assurances sociales en entreprise.',
  formationChargesSocialesCardDuration: '2 jours',
  formationChargesSocialesCardLevel: 'Avancé',
  formationChargesSocialesCardPrice: 'CHF 980',
  formationChargesSocialesFeature1: 'AVS, AI, APG et LPP',
  formationChargesSocialesFeature2: 'Calcul des cotisations',
  formationChargesSocialesFeature3: 'Déclarations sociales',
  formationChargesSocialesFeature4: 'Optimisation fiscale',

  // Formation Card Fields - Impôt à la Source
  formationImpotALaSourceIcon: '🌍',
  formationImpotALaSourceCardTitle: 'Impôt à la Source',
  formationImpotALaSourceCardDescription: 'Formation spécialisée sur l\'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Procédures et bonnes pratiques.',
  formationImpotALaSourceCardDuration: '1.5 jours',
  formationImpotALaSourceCardLevel: 'Spécialisé',
  formationImpotALaSourceCardPrice: 'CHF 750',
  formationImpotALaSourceFeature1: 'Réglementation suisse',
  formationImpotALaSourceFeature2: 'Calcul de l\'impôt à la source',
  formationImpotALaSourceFeature3: 'Déclarations fiscales',
  formationImpotALaSourceFeature4: 'Cas particuliers frontaliers'
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
    // Only try to load from server if we're in the browser
    if (typeof window !== 'undefined') {
      try {
        // Try to load from server first
        const response = await fetch('/api/content');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.content) {
            this.content = { ...defaultContent, ...data.content };
            this.isLoaded = true;
            console.log('Content loaded from server API');
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load content from server, trying localStorage:', error);
      }
      
      // Fallback to localStorage
      try {
        const savedContent = localStorage.getItem('websiteContent');
        if (savedContent) {
          const parsed = JSON.parse(savedContent);
          this.content = { ...defaultContent, ...parsed };
          console.log('Content loaded from localStorage');
        } else {
          console.log('No saved content found, using defaults');
        }
      } catch (error) {
        console.error('Error loading content from localStorage:', error);
      }
    } else {
      // Server-side: use default content
      console.log('Server-side: using default content');
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
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Content saved to server successfully');
        } else {
          console.warn('Server returned error:', data.error);
        }
      } else {
        console.warn('Failed to save content to server, status:', response.status);
      }
      
      // Always save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('websiteContent', JSON.stringify(this.content));
        console.log('Content saved to localStorage as backup');
      }
    } catch (error) {
      console.error('Error saving content to server:', error);
      
      // Fallback to localStorage only
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('websiteContent', JSON.stringify(this.content));
          console.log('Content saved to localStorage only');
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
