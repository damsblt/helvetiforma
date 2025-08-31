'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContentSection {
  id: string;
  title: string;
  fields: ContentField[];
}

interface ContentField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'html';
  value: string;
  placeholder?: string;
}

export default function ContentManagement() {
  const router = useRouter();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Initialize content sections with current website content
    initializeContentSections();
  }, []);

  const initializeContentSections = () => {
    // Try to load existing content from localStorage first
    let existingContent: Record<string, string> = {};
    try {
      const savedContent = localStorage.getItem('websiteContent');
      if (savedContent) {
        existingContent = JSON.parse(savedContent);
        console.log('Loaded existing content:', existingContent);
      }
    } catch (error) {
      console.error('Error loading existing content:', error);
    }

    const initialSections: ContentSection[] = [
      {
        id: 'hero',
        title: 'Section Hero (Page d\'accueil)',
        fields: [
          {
            name: 'heroTitle',
            label: 'Titre principal',
            type: 'html',
            value: existingContent.heroTitle || 'Bienvenue sur <span class="text-blue-400">Helvetiforma</span>',
            placeholder: 'Titre principal de la page d\'accueil'
          },
          {
            name: 'heroDescription',
            label: 'Description',
            type: 'textarea',
            value: existingContent.heroDescription || 'Votre plateforme de formation professionnelle en Suisse. Découvrez nos formations spécialisées et développez vos compétences avec une approche moderne et flexible.',
            placeholder: 'Description sous le titre principal'
          }
        ]
      },
      {
        id: 'about',
        title: 'Section À propos',
        fields: [
          {
            name: 'aboutTitle',
            label: 'Titre de la section',
            type: 'text',
            value: existingContent.aboutTitle || 'Une approche moderne de la formation',
            placeholder: 'Titre de la section à propos'
          },
          {
            name: 'aboutContent',
            label: 'Contenu',
            type: 'textarea',
            value: existingContent.aboutContent || 'Helvetiforma révolutionne l\'apprentissage professionnel en combinant la flexibilité du digital avec l\'efficacité de l\'enseignement traditionnel.',
            placeholder: 'Contenu de la section à propos'
          },
          {
            name: 'aboutSubContent',
            label: 'Contenu supplémentaire',
            type: 'textarea',
            value: existingContent.aboutSubContent || 'Notre plateforme vous offre un accès à des ressources de qualité, des modules interactifs et un suivi personnalisé pour maximiser vos chances de réussite.',
            placeholder: 'Contenu supplémentaire de la section à propos'
          }
        ]
      },
      {
        id: 'features',
        title: 'Section Fonctionnalités',
        fields: [
          {
            name: 'featuresTitle',
            label: 'Titre de la section',
            type: 'text',
            value: existingContent.featuresTitle || 'Pourquoi choisir Helvetiforma ?',
            placeholder: 'Titre de la section fonctionnalités'
          },
          {
            name: 'feature1Title',
            label: 'Fonctionnalité 1 - Titre',
            type: 'text',
            value: existingContent.feature1Title || 'Formations Certifiantes',
            placeholder: 'Titre de la première fonctionnalité'
          },
          {
            name: 'feature1Description',
            label: 'Fonctionnalité 1 - Description',
            type: 'textarea',
            value: existingContent.feature1Description || 'Nos programmes délivrent des certificats reconnus qui attestent de vos compétences acquises et valorisent votre CV.',
            placeholder: 'Description de la première fonctionnalité'
          },
          {
            name: 'feature2Title',
            label: 'Fonctionnalité 2 - Titre',
            type: 'text',
            value: existingContent.feature2Title || 'Apprentissage Flexible',
            placeholder: 'Titre de la deuxième fonctionnalité'
          },
          {
            name: 'feature2Description',
            label: 'Fonctionnalité 2 - Description',
            type: 'textarea',
            value: existingContent.feature2Description || 'Combinez cours en ligne et sessions en présentiel selon vos disponibilités. Apprenez à votre rythme, où et quand vous voulez.',
            placeholder: 'Description de la deuxième fonctionnalité'
          },
          {
            name: 'feature3Title',
            label: 'Fonctionnalité 3 - Titre',
            type: 'text',
            value: existingContent.feature3Title || 'Support Personnalisé',
            placeholder: 'Titre de la troisième fonctionnalité'
          },
          {
            name: 'feature3Description',
            label: 'Fonctionnalité 3 - Description',
            type: 'textarea',
            value: existingContent.feature3Description || 'Bénéficiez d\'un accompagnement sur mesure avec nos formateurs experts et notre équipe dédiée à votre réussite.',
            placeholder: 'Description de la troisième fonctionnalité'
          }
        ]
      },
      {
        id: 'stats',
        title: 'Section Statistiques',
        fields: [
          {
            name: 'statsTitle',
            label: 'Titre de la section',
            type: 'text',
            value: existingContent.statsTitle || 'Nos chiffres parlent d\'eux-mêmes',
            placeholder: 'Titre de la section statistiques'
          },
          {
            name: 'statsSubtitle',
            label: 'Sous-titre de la section',
            type: 'text',
            value: existingContent.statsSubtitle || 'Une croissance constante et des résultats probants',
            placeholder: 'Sous-titre de la section statistiques'
          },
          {
            name: 'statsLearners',
            label: 'Apprenants formés',
            type: 'text',
            value: existingContent.statsLearners || '500+',
            placeholder: 'Nombre d\'apprenants formés'
          },
          {
            name: 'statsFormations',
            label: 'Formations disponibles',
            type: 'text',
            value: existingContent.statsFormations || '50+',
            placeholder: 'Nombre de formations disponibles'
          },
          {
            name: 'statsSatisfaction',
            label: 'Taux de satisfaction',
            type: 'text',
            value: existingContent.statsSatisfaction || '95%',
            placeholder: 'Taux de satisfaction'
          },
          {
            name: 'statsSupport',
            label: 'Support disponible',
            type: 'text',
            value: existingContent.statsSupport || '24/7',
            placeholder: 'Disponibilité du support'
          }
        ]
      },
      {
        id: 'cta',
        title: 'Section Appel à l\'action (CTA)',
        fields: [
          {
            name: 'ctaTitle',
            label: 'Titre de la section',
            type: 'text',
            value: existingContent.ctaTitle || 'Prêt à développer vos compétences ?',
            placeholder: 'Titre de la section CTA'
          },
          {
            name: 'ctaSubtitle',
            label: 'Sous-titre de la section',
            type: 'text',
            value: existingContent.ctaSubtitle || 'Rejoignez des centaines de professionnels qui ont déjà choisi Helvetiforma pour leur formation continue.',
            placeholder: 'Sous-titre de la section CTA'
          },
          {
            name: 'ctaButton1',
            label: 'Bouton 1 - Texte',
            type: 'text',
            value: existingContent.ctaButton1 || 'Consulter nos ressources',
            placeholder: 'Texte du premier bouton'
          },
          {
            name: 'ctaButton2',
            label: 'Bouton 2 - Texte',
            type: 'text',
            value: existingContent.ctaButton2 || 'Nous contacter',
            placeholder: 'Texte du deuxième bouton'
          }
        ]
      },
      {
        id: 'formations',
        title: 'Gestion des Formations',
        fields: [
          {
            name: 'formationSalairesTitle',
            label: 'Formation Salaires - Titre',
            type: 'text',
            value: existingContent.formationSalairesTitle || 'Formation Salaires',
            placeholder: 'Titre de la formation salaires'
          },
          {
            name: 'formationSalairesDescription',
            label: 'Formation Salaires - Description',
            type: 'textarea',
            value: existingContent.formationSalairesDescription || 'Formation complète sur la gestion des salaires en Suisse',
            placeholder: 'Description de la formation salaires'
          },
          {
            name: 'formationChargesTitle',
            label: 'Formation Charges Sociales - Titre',
            type: 'text',
            value: existingContent.formationChargesTitle || 'Charges Sociales',
            placeholder: 'Titre de la formation charges sociales'
          },
          {
            name: 'formationChargesDescription',
            label: 'Formation Charges Sociales - Description',
            type: 'textarea',
            value: existingContent.formationChargesDescription || 'Formation sur les charges sociales et assurances en Suisse',
            placeholder: 'Description de la formation charges sociales'
          },
          {
            name: 'formationImpotTitle',
            label: 'Formation Impôt à la Source - Titre',
            type: 'text',
            value: existingContent.formationImpotTitle || 'Impôt à la Source',
            placeholder: 'Titre de la formation impôt à la source'
          },
          {
            name: 'formationImpotDescription',
            label: 'Formation Impôt à la Source - Description',
            type: 'textarea',
            value: existingContent.formationImpotDescription || 'Formation sur l\'impôt à la source en Suisse',
            placeholder: 'Description de la formation impôt à la source'
          }
        ]
      },
      {
        id: 'contact',
        title: 'Section Contact',
        fields: [
          {
            name: 'contactTitle',
            label: 'Titre de la section contact',
            type: 'text',
            value: existingContent.contactTitle || 'Contactez-nous',
            placeholder: 'Titre de la section contact'
          },
          {
            name: 'contactDescription',
            label: 'Description de la section contact',
            type: 'textarea',
            value: existingContent.contactDescription || 'N\'hésitez pas à nous contacter pour plus d\'informations sur nos formations.',
            placeholder: 'Description de la section contact'
          }
        ]
      }
    ];

    setSections(initialSections);
    setIsLoading(false);
  };

  const handleFieldChange = (sectionId: string, fieldName: string, value: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              fields: section.fields.map(field => 
                field.name === fieldName 
                  ? { ...field, value }
                  : field
              )
            }
          : section
      )
    );
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Save content to localStorage (can be replaced with API call later)
      const contentData = sections.reduce((acc, section) => {
        section.fields.forEach(field => {
          acc[field.name] = field.value;
        });
        return acc;
      }, {} as Record<string, string>);
      
      localStorage.setItem('websiteContent', JSON.stringify(contentData));
      console.log('Content saved successfully:', contentData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      
      // Refresh the page after successful save
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handlePreview = () => {
    // Save current content and redirect to homepage to preview
    const contentData = sections.reduce((acc, section) => {
      section.fields.forEach(field => {
        acc[field.name] = field.value;
      });
      return acc;
    }, {} as Record<string, string>);
    
    localStorage.setItem('websiteContent', JSON.stringify(contentData));
    console.log('Content saved for preview:', contentData);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'éditeur de contenu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Contenu</h1>
          <p className="text-gray-600">
            Modifiez le contenu de votre site web. Tous les changements sont sauvegardés automatiquement.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? 'Sauvegarde...' : 
             saveStatus === 'saved' ? '✓ Sauvegardé' : 
             saveStatus === 'error' ? '❌ Erreur' : '💾 Sauvegarder'}
          </button>
          
          <button
            onClick={handlePreview}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            👁️ Aperçu
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={field.value}
                        onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : field.type === 'html' ? (
                      <textarea
                        value={field.value}
                        onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    
                    {field.type === 'html' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Support HTML: utilisez des balises comme &lt;span&gt;, &lt;strong&gt;, &lt;em&gt;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 