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
  formationSalairesIncluded: string;
  formationSalairesDuration: string;
  formationSalairesLevel: string;
  formationSalairesPrice: string;
  formationSalairesParticipants: string;
  formationSalairesObjectives: string;
  formationSalairesKeyConcepts: string;
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
  
  formationChargesTitle: string;
  formationChargesDescription: string;
  formationChargesOverview: string;
  formationChargesTargetAudience: string;
  formationChargesPrerequisites: string;
  formationChargesKeyConcepts: string;
  formationChargesKeyConcept1Title: string;
  formationChargesKeyConcept1Description: string;
  formationChargesKeyConcept2Title: string;
  formationChargesKeyConcept2Description: string;
  formationChargesKeyConcept3Title: string;
  formationChargesKeyConcept3Description: string;
  formationChargesKeyConcept4Title: string;
  formationChargesKeyConcept4Description: string;
  formationChargesObjectives: string;
  formationChargesIncluded: string;
  formationChargesCtaTitle: string;
  formationChargesCtaDescription: string;
  
  formationImpotTitle: string;
  formationImpotDescription: string;
  formationImpotOverview: string;
  formationImpotTargetAudience: string;
  formationImpotPrerequisites: string;
  formationImpotIncluded: string;
  formationImpotObjectives: string;
  formationImpotDuration: string;
  formationImpotLevel: string;
  formationImpotPrice: string;
  formationImpotParticipants: string;
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
  conceptFeatures: string;
  conceptPhilosophy: string;
  conceptPersonalizedApproach: string;
  conceptSkillsValidation: string;
  conceptDistanceTitle: string;
  conceptDistanceDescription: string;
  conceptPresentialTitle: string;
  conceptPresentialDescription: string;
  conceptHybridTitle: string;
  conceptHybridSubtitle: string;
  conceptAdvantage1Title: string;
  conceptAdvantage1Description: string;
  conceptAdvantage2Title: string;
  conceptAdvantage2Description: string;
  conceptAdvantage3Title: string;
  conceptAdvantage3Description: string;
  conceptAdvantage4Title: string;
  conceptAdvantage4Description: string;
  conceptFeaturesTitle: string;
  conceptFeaturesContent: string;
  conceptCtaTitle: string;
  conceptCtaDescription: string;
  conceptBenefits: string;
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
  formationSalairesIncluded: 'Support de cours complet\nCas pratiques et exercices\nCertificat de participation\nAccès aux ressources en ligne\nSupport post-formation',
  formationSalairesDuration: '3 jours',
  formationSalairesLevel: 'Niveau Intermédiaire',
  formationSalairesPrice: 'CHF 1,200',
  formationSalairesParticipants: 'Max 12 participants',
  formationSalairesObjectives: 'Maîtriser la réglementation suisse des salaires\nGérer efficacement les avantages sociaux\nOptimiser les processus de gestion RH\nAssurer la conformité légale',
  formationSalairesKeyConcepts: 'Cadre Légal Suisse\nMaîtrisez les obligations légales de l\'employeur et la structure des salaires en Suisse.\n\nCalcul des Salaires\nApprenez à calculer précisément les salaires de base, variables et les heures supplémentaires.\n\nGestion RH\nGérez efficacement les congés, absences et avantages sociaux selon la réglementation.\n\nConformité et Optimisation\nAssurez la conformité légale tout en optimisant les processus de gestion RH.',
  formationSalairesKeyConcept1Title: 'Cadre Légal Suisse',
  formationSalairesKeyConcept1Description: 'Maîtrisez les obligations légales de l\'employeur et la structure des salaires en Suisse.',
  formationSalairesKeyConcept2Title: 'Calcul des Salaires',
  formationSalairesKeyConcept2Description: 'Apprenez à calculer précisément les salaires de base, variables et les heures supplémentaires.',
  formationSalairesKeyConcept3Title: 'Gestion RH',
  formationSalairesKeyConcept3Description: 'Gérez efficacement les congés, absences et avantages sociaux selon la réglementation.',
  formationSalairesKeyConcept4Title: 'Conformité et Optimisation',
  formationSalairesKeyConcept4Description: 'Assurez la conformité légale tout en optimisant les processus de gestion RH.',
  formationSalairesCtaTitle: 'Prêt à Maîtriser la Gestion des Salaires ?',
  formationSalairesCtaDescription: 'Rejoignez notre formation et développez des compétences essentielles pour votre carrière et votre entreprise. Contactez-nous pour plus d\'informations.',
  
  // Formation Charges Sociales
  formationChargesTitle: 'Charges Sociales',
  formationChargesDescription: 'Formation sur les charges sociales et assurances en Suisse',
  formationChargesOverview: 'Formation complète sur la gestion des charges sociales et assurances en Suisse.',
  formationChargesTargetAudience: 'Responsables RH\nComptables\nGestionnaires de paie\nChefs d\'entreprise',
  formationChargesPrerequisites: 'Connaissances de base en comptabilité\nExpérience en gestion d\'entreprise\nMaîtrise du français',
  formationChargesKeyConcepts: 'AVS - Assurance Vieillesse et Survivants\nCotisation de base obligatoire pour tous les employés. Taux : 8.7% partagé entre employeur et employé.\n\nAI - Assurance Invalidité\nProtection en cas d\'invalidité. Taux : 1.4% partagé entre employeur et employé.\n\nAPG - Allocations pour Perte de Gain\nIndemnités pendant le service militaire et la maternité. Taux : 0.5% à la charge de l\'employeur.\n\nLPP - Prévoyance Professionnelle\nDeuxième pilier de la prévoyance. Taux variable selon l\'âge et le salaire, partagé entre employeur et employé.',
  formationChargesKeyConcept1Title: 'AVS - Assurance Vieillesse et Survivants',
  formationChargesKeyConcept1Description: 'Cotisation de base obligatoire pour tous les employés. Taux : 8.7% partagé entre employeur et employé.',
  formationChargesKeyConcept2Title: 'AI - Assurance Invalidité',
  formationChargesKeyConcept2Description: 'Protection en cas d\'invalidité. Taux : 1.4% partagé entre employeur et employé.',
  formationChargesKeyConcept3Title: 'APG - Allocations pour Perte de Gain',
  formationChargesKeyConcept3Description: 'Indemnités pendant le service militaire et la maternité. Taux : 0.5% à la charge de l\'employeur.',
  formationChargesKeyConcept4Title: 'LPP - Prévoyance Professionnelle',
  formationChargesKeyConcept4Description: 'Deuxième pilier de la prévoyance. Taux variable selon l\'âge et le salaire, partagé entre employeur et employé.',
  formationChargesObjectives: 'Maîtriser la réglementation des assurances sociales\nCalculer précisément toutes les cotisations\nGérer les déclarations sociales\nOptimiser les charges sociales',
  formationChargesIncluded: 'Support de cours complet\nCalculateurs et outils pratiques\nCertificat de participation\nAccès aux ressources en ligne\nSupport post-formation',
  formationChargesCtaTitle: 'Prêt à Maîtriser les Charges Sociales ?',
  formationChargesCtaDescription: 'Rejoignez notre formation avancée et développez une expertise reconnue dans la gestion des charges sociales et des cotisations en Suisse.',
  
  // Formation Impôt à la Source
  formationImpotTitle: 'Impôt à la Source',
  formationImpotDescription: 'Formation spécialisée sur l\'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Procédures, calculs et bonnes pratiques pour une gestion fiscale optimale.',
  formationImpotOverview: 'Cette formation intensive de 1.5 jours vous permettra de maîtriser tous les aspects de l\'impôt à la source en Suisse, particulièrement important pour les travailleurs frontaliers et les employés étrangers.\n\nVous apprendrez à calculer, déclarer et optimiser l\'impôt à la source tout en respectant la réglementation suisse et en maximisant les avantages pour votre entreprise et vos employés.',
  formationImpotTargetAudience: 'Responsables RH internationaux\nComptables spécialisés fiscalité\nConsultants en mobilité internationale\nAvocats fiscalistes\nChefs d\'entreprise frontaliers',
  formationImpotPrerequisites: 'Connaissances en fiscalité (2+ ans)\nExpérience en gestion RH\nMaîtrise du français\nCompréhension des relations internationales',
  formationImpotIncluded: 'Support de cours complet\nCalculateurs d\'impôt à la source\nCertificat de participation\nAccès aux ressources en ligne\nSupport post-formation',
  formationImpotObjectives: 'Comprendre la réglementation suisse\nCalculer précisément l\'impôt à la source\nGérer les déclarations fiscales\nOptimiser la gestion fiscale',
  formationImpotDuration: '1.5 jours',
  formationImpotLevel: 'Niveau Spécialisé',
  formationImpotPrice: 'CHF 750',
  formationImpotParticipants: 'Max 8 participants',
  formationImpotKeyConcept1Title: 'Qu\'est-ce que l\'Impôt à la Source ?',
  formationImpotKeyConcept1Description: 'L\'impôt à la source est un prélèvement fiscal automatique effectué par l\'employeur sur le salaire des travailleurs étrangers et frontaliers, avant le versement du salaire net.',
  formationImpotKeyConcept2Title: 'Travailleurs Concernés',
  formationImpotKeyConcept2Description: 'Travailleurs frontaliers (France, Allemagne, Italie, Autriche)\nEmployés étrangers sans permis C\nStagiaires et apprentis étrangers\nConsultants internationaux',
  formationImpotKeyConcept3Title: 'Obligations de l\'Employeur',
  formationImpotKeyConcept3Description: 'Calculer et prélever l\'impôt à la source\nDéclarer les salaires et impôts prélevés\nVerser l\'impôt aux autorités fiscales\nTenir une comptabilité détaillée',
  formationImpotKeyConcept4Title: 'Avantages de l\'Impôt à la Source',
  formationImpotKeyConcept4Description: 'Simplification pour le travailleur\nPas de déclaration fiscale annuelle\nGestion centralisée par l\'employeur\nRespect automatique des obligations fiscales',
  formationImpotCtaTitle: 'Prêt à Maîtriser l\'Impôt à la Source ?',
  formationImpotCtaDescription: 'Rejoignez notre formation spécialisée et développez une expertise unique dans la gestion de l\'impôt à la source pour les travailleurs internationaux en Suisse.',
  
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
  conceptFeatures: 'Nos avantages : Flexibilité, Accessibilité, Suivi Personnalisé, Support 24/7',
  conceptPhilosophy: 'HelvetiForma est une plateforme de formation en ligne qui vous offre la liberté d\'apprendre à votre rythme, où et quand vous voulez. Nous vous aidons à acquérir les compétences nécessaires pour réussir dans votre carrière.',
  conceptPersonalizedApproach: 'Notre approche combine le meilleur de l\'apprentissage en ligne et en présentiel pour créer une expérience d\'apprentissage optimale et engageante.',
  conceptSkillsValidation: 'Nous croyons que l\'apprentissage efficace passe par une combinaison de flexibilité numérique et de validation humaine des compétences acquises.',
  conceptDistanceTitle: 'Formation à distance',
  conceptDistanceDescription: 'Modules en ligne flexibles et accessibles 24h/24',
  conceptPresentialTitle: 'Sessions en présentiel',
  conceptPresentialDescription: 'Validation des acquis et pratique avec nos formateurs experts',
  conceptHybridTitle: 'Formation hybride',
  conceptHybridSubtitle: 'Le meilleur des deux mondes',
  conceptAdvantage1Title: 'Flexibilité maximale',
  conceptAdvantage1Description: 'Apprenez à votre rythme, où et quand vous voulez',
  conceptAdvantage2Title: 'Suivi personnalisé',
  conceptAdvantage2Description: 'Accompagnement sur mesure avec nos formateurs experts',
  conceptAdvantage3Title: 'Ressources de qualité',
  conceptAdvantage3Description: 'Contenu pédagogique créé par des experts du domaine',
  conceptAdvantage4Title: 'Certification reconnue',
  conceptAdvantage4Description: 'Diplômes et certificats valorisés par les employeurs',
  conceptFeaturesTitle: 'Fonctionnalités de notre concept',
  conceptFeaturesContent: 'Nos avantages : Flexibilité, Accessibilité, Suivi Personnalisé, Support 24/7',
  conceptCtaTitle: 'Prêt à commencer votre formation ?',
  conceptCtaDescription: 'Découvrez nos formations spécialisées et commencez votre parcours d\'apprentissage dès aujourd\'hui avec notre approche hybride innovante.',
  conceptBenefits: 'Nos avantages : Flexibilité, Accessibilité, Suivi Personnalisé, Support 24/7'
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
  
  // Refresh content from localStorage
  refreshContent(): void {
    this.content = this.loadContent();
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
