import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Default content values
const defaultContent = {
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
  formationDuration: '3 jours',
  formationMaxParticipants: 'Max 12 participants',
  formationPrice: 'CHF 1,200',
  formationLevel: 'Niveau Intermédiaire',
  contactTitle: 'Contactez-nous',
  contactDescription: 'N\'hésitez pas à nous contacter pour plus d\'informations sur nos formations.',
  contactEmail: 'info@helvetiforma.ch',
  contactLocation: 'Suisse',
  contactResponseTime: 'Sous 24-48 heures',
  whyChooseUsTitle: 'Pourquoi nous choisir ?',
  whyChooseUsPoint1: 'Formations certifiantes',
  whyChooseUsPoint2: 'Support personnalisé',
  whyChooseUsPoint3: 'Flexibilité d\'apprentissage',
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

// Check if Supabase is available
const isSupabaseAvailable = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

// GET - Load content from Supabase or return default
export async function GET() {
  try {
    // Check if Supabase is available
    if (!isSupabaseAvailable()) {
      console.log('Supabase not configured, returning default content');
      return NextResponse.json({ success: true, content: defaultContent });
    }

    // Try to load from Supabase
    const { data, error } = await supabase
      .from('website_content')
      .select('content')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.warn('Error loading content from Supabase:', error);
      return NextResponse.json({ success: true, content: defaultContent });
    }
    
    if (data && data.content) {
      console.log('Content loaded from Supabase');
      return NextResponse.json({ success: true, content: data.content });
    }
    
    // If no content in Supabase, return default content
    console.log('No content in Supabase, returning default content');
    return NextResponse.json({ success: true, content: defaultContent });
  } catch (error) {
    console.warn('Supabase error, returning default content:', error);
    // Fallback to default content if Supabase is not available
    return NextResponse.json({ success: true, content: defaultContent });
  }
}

// POST - Save content to Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }
    
    // Check if Supabase is available
    if (!isSupabaseAvailable()) {
      console.log('Supabase not configured, content not saved');
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured. Content cannot be saved.' 
      }, { status: 500 });
    }
    
    // Save content to Supabase (upsert - insert or update)
    const { error } = await supabase
      .from('website_content')
      .upsert({ 
        id: 1, 
        content: content,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving content to Supabase:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save content to Supabase' 
      }, { status: 500 });
    }
    
    console.log('Content saved to Supabase');
    return NextResponse.json({ success: true, message: 'Content saved successfully' });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process content' 
    }, { status: 500 });
  }
}