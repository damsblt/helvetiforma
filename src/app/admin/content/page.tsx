'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentService, WebsiteContent } from '@/services/contentService';
import { authService } from '@/services/authService';

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

interface PageOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  sections: ContentSection[];
}

export default function ContentManagement() {
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

  // Check authentication immediately
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login?redirect=/admin/content');
      return;
    }

    const user = authService.getUser();
    if (!user || !user.isAdmin) {
      console.log('Not admin, redirecting to login');
      router.push('/login?message=admin_required');
      return;
    }

    console.log('User authenticated and is admin:', user);
  }, [router]);

  // Debug authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        const user = authService.getUser();
        // setAuthStatus(`Auth: ${isAuth}, User: ${JSON.stringify(user)}`);
        console.log('Auth check:', { isAuth, user });
      } catch (error) {
        setAuthStatus(`Error: ${error}`);
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);

  // Define all available pages with their content sections
  const pageOptions: PageOption[] = [
    {
      id: 'accueil',
      title: 'Page d\'Accueil',
      description: 'Modifiez le contenu de la page principale : titre, description, sections à propos, fonctionnalités, statistiques et CTA.',
      icon: '🏠',
      color: 'blue',
      sections: [
        {
          id: 'hero',
          title: 'Section Hero',
          fields: [
            {
              name: 'heroTitle',
              label: 'Titre principal',
              type: 'html',
              value: '',
              placeholder: 'Titre principal de la page d\'accueil'
            },
            {
              name: 'heroDescription',
              label: 'Description',
              type: 'textarea',
              value: '',
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
              value: '',
              placeholder: 'Titre de la section à propos'
            },
            {
              name: 'aboutSubtitle',
              label: 'Sous-titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Sous-titre de la section à propos'
            },
            {
              name: 'aboutContent',
              label: 'Contenu principal',
              type: 'textarea',
              value: '',
              placeholder: 'Contenu principal de la section à propos'
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
              value: '',
              placeholder: 'Titre de la section fonctionnalités'
            },
            {
              name: 'featuresSubtitle',
              label: 'Sous-titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Sous-titre de la section fonctionnalités'
            },
            {
              name: 'feature1Title',
              label: 'Fonctionnalité 1 - Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la première fonctionnalité'
            },
            {
              name: 'feature1Description',
              label: 'Fonctionnalité 1 - Description',
              type: 'textarea',
              value: '',
              placeholder: 'Description de la première fonctionnalité'
            },
            {
              name: 'feature2Title',
              label: 'Fonctionnalité 2 - Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la deuxième fonctionnalité'
            },
            {
              name: 'feature2Description',
              label: 'Fonctionnalité 2 - Description',
              type: 'textarea',
              value: '',
              placeholder: 'Description de la deuxième fonctionnalité'
            },
            {
              name: 'feature3Title',
              label: 'Fonctionnalité 3 - Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la troisième fonctionnalité'
            },
            {
              name: 'feature3Description',
              label: 'Fonctionnalité 3 - Description',
              type: 'textarea',
              value: '',
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
              value: '',
              placeholder: 'Titre de la section statistiques'
            },
            {
              name: 'statsSubtitle',
              label: 'Sous-titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Sous-titre de la section statistiques'
            },
            {
              name: 'statsLearners',
              label: 'Apprenants formés',
              type: 'text',
              value: '',
              placeholder: 'Nombre d\'apprenants formés'
            },
            {
              name: 'statsFormations',
              label: 'Formations disponibles',
              type: 'text',
              value: '',
              placeholder: 'Nombre de formations disponibles'
            },
            {
              name: 'statsSatisfaction',
              label: 'Taux de satisfaction',
              type: 'text',
              value: '',
              placeholder: 'Taux de satisfaction'
            },
            {
              name: 'statsSupport',
              label: 'Support disponible',
              type: 'text',
              value: '',
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
              value: '',
              placeholder: 'Titre de la section CTA'
            },
            {
              name: 'ctaSubtitle',
              label: 'Sous-titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Sous-titre de la section CTA'
            },
            {
              name: 'ctaButton1',
              label: 'Bouton 1 - Texte',
              type: 'text',
              value: '',
              placeholder: 'Texte du premier bouton'
            },
            {
              name: 'ctaButton2',
              label: 'Bouton 2 - Texte',
              type: 'text',
              value: '',
              placeholder: 'Texte du deuxième bouton'
            }
          ]
        }
      ]
    },
    {
      id: 'concept',
      title: 'Page Concept',
      description: 'Modifiez le contenu de la page concept : titre, sous-titre, contenu principal et fonctionnalités.',
      icon: '💡',
      color: 'green',
      sections: [
        {
          id: 'concept',
          title: 'Section Concept',
          fields: [
            {
              name: 'conceptTitle',
              label: 'Titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Titre de la section concept'
            },
            {
              name: 'conceptSubtitle',
              label: 'Sous-titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Sous-titre de la section concept'
            },
            {
              name: 'conceptContent',
              label: 'Contenu principal',
              type: 'textarea',
              value: '',
              placeholder: 'Contenu principal de la section concept'
            }
          ]
        }
      ]
    },
    {
      id: 'formations',
      title: 'Page Formations',
      description: 'Modifiez le contenu des formations : 3 sections séparées pour Salaires, Charges Sociales et Impôt à la Source.',
      icon: '📚',
      color: 'purple',
      sections: [
        {
          id: 'formationSalaires',
          title: 'Formation Salaires',
          fields: [
            {
              name: 'formationSalairesTitle',
              label: 'Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la formation salaires'
            },
            {
              name: 'formationSalairesDescription',
              label: 'Description courte',
              type: 'textarea',
              value: '',
              placeholder: 'Description courte de la formation salaires'
            },
            {
              name: 'formationSalairesOverview',
              label: 'Aperçu détaillé',
              type: 'textarea',
              value: '',
              placeholder: 'Aperçu détaillé de la formation salaires'
            },
            {
              name: 'formationSalairesDay1',
              label: 'Jour 1 - Contenu',
              type: 'textarea',
              value: '',
              placeholder: 'Contenu détaillé du jour 1 (une ligne par point)'
            },
            {
              name: 'formationSalairesDay2',
              label: 'Jour 2 - Contenu',
              type: 'textarea',
              value: '',
              placeholder: 'Contenu détaillé du jour 2 (une ligne par point)'
            },
            {
              name: 'formationSalairesDay3',
              label: 'Jour 3 - Contenu',
              type: 'textarea',
              value: '',
              placeholder: 'Contenu détaillé du jour 3 (une ligne par point)'
            },
            {
              name: 'formationSalairesTargetAudience',
              label: 'Public cible',
              type: 'textarea',
              value: '',
              placeholder: 'Liste du public cible (une ligne par rôle)'
            },
            {
              name: 'formationSalairesPrerequisites',
              label: 'Prérequis',
              type: 'textarea',
              value: '',
              placeholder: 'Liste des prérequis (une ligne par prérequis)'
            },
            {
              name: 'formationSalairesDuration',
              label: 'Durée',
              type: 'text',
              value: '',
              placeholder: '3 jours'
            },
            {
              name: 'formationSalairesMaxParticipants',
              label: 'Participants maximum',
              type: 'text',
              value: '',
              placeholder: 'Max 12 participants'
            },
            {
              name: 'formationSalairesPrice',
              label: 'Prix',
              type: 'text',
              value: '',
              placeholder: 'CHF 1,200'
            },
            {
              name: 'formationSalairesLevel',
              label: 'Niveau',
              type: 'text',
              value: '',
              placeholder: 'Niveau Intermédiaire'
            }
          ]
        },
        {
          id: 'formationCharges',
          title: 'Formation Charges Sociales',
          fields: [
            {
              name: 'formationChargesTitle',
              label: 'Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la formation charges sociales'
            },
            {
              name: 'formationChargesDescription',
              label: 'Description courte',
              type: 'textarea',
              value: '',
              placeholder: 'Description courte de la formation charges sociales'
            },
            {
              name: 'formationChargesOverview',
              label: 'Aperçu détaillé',
              type: 'textarea',
              value: '',
              placeholder: 'Aperçu détaillé de la formation charges sociales'
            },
            {
              name: 'formationChargesTargetAudience',
              label: 'Public cible',
              type: 'textarea',
              value: '',
              placeholder: 'Liste du public cible (une ligne par rôle)'
            },
            {
              name: 'formationChargesPrerequisites',
              label: 'Prérequis',
              type: 'textarea',
              value: '',
              placeholder: 'Liste des prérequis (une ligne par prérequis)'
            },
            {
              name: 'formationChargesDuration',
              label: 'Durée',
              type: 'text',
              value: '',
              placeholder: '2 jours'
            },
            {
              name: 'formationChargesMaxParticipants',
              label: 'Participants maximum',
              type: 'text',
              value: '',
              placeholder: 'Max 10 participants'
            },
            {
              name: 'formationChargesPrice',
              label: 'Prix',
              type: 'text',
              value: '',
              placeholder: 'CHF 800'
            },
            {
              name: 'formationChargesLevel',
              label: 'Niveau',
              type: 'text',
              value: '',
              placeholder: 'Niveau Débutant'
            }
          ]
        },
        {
          id: 'formationImpot',
          title: 'Formation Impôt à la Source',
          fields: [
            {
              name: 'formationImpotTitle',
              label: 'Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la formation impôt à la source'
            },
            {
              name: 'formationImpotDescription',
              label: 'Description courte',
              type: 'textarea',
              value: '',
              placeholder: 'Description courte de la formation impôt à la source'
            },
            {
              name: 'formationImpotOverview',
              label: 'Aperçu détaillé',
              type: 'textarea',
              value: '',
              placeholder: 'Aperçu détaillé de la formation impôt à la source'
            },
            {
              name: 'formationImpotTargetAudience',
              label: 'Public cible',
              type: 'textarea',
              value: '',
              placeholder: 'Liste du public cible (une ligne par rôle)'
            },
            {
              name: 'formationImpotPrerequisites',
              label: 'Prérequis',
              type: 'textarea',
              value: '',
              placeholder: 'Liste des prérequis (une ligne par prérequis)'
            },
            {
              name: 'formationImpotDuration',
              label: 'Durée',
              type: 'text',
              value: '',
              placeholder: '2.5 jours'
            },
            {
              name: 'formationImpotMaxParticipants',
              label: 'Participants maximum',
              type: 'text',
              value: '',
              placeholder: 'Max 8 participants'
            },
            {
              name: 'formationImpotPrice',
              label: 'Prix',
              type: 'text',
              value: '',
              placeholder: 'CHF 1,000'
            },
            {
              name: 'formationImpotLevel',
              label: 'Niveau',
              type: 'text',
              value: '',
              placeholder: 'Niveau Avancé'
            }
          ]
        }
      ]
    },
    {
      id: 'contact',
      title: 'Page Contact',
      description: 'Modifiez le contenu de la page contact : titre, description, informations de contact et FAQ.',
      icon: '📞',
      color: 'orange',
      sections: [
        {
          id: 'contact',
          title: 'Section Contact',
          fields: [
            {
              name: 'contactTitle',
              label: 'Titre de la section contact',
              type: 'text',
              value: '',
              placeholder: 'Titre de la section contact'
            },
            {
              name: 'contactDescription',
              label: 'Description de la section contact',
              type: 'textarea',
              value: '',
              placeholder: 'Description de la section contact'
            }
          ]
        },
        {
          id: 'contactInfo',
          title: 'Informations de Contact',
          fields: [
            {
              name: 'contactEmail',
              label: 'Adresse email',
              type: 'text',
              value: '',
              placeholder: 'info@helvetiforma.ch'
            },
            {
              name: 'contactLocation',
              label: 'Localisation',
              type: 'text',
              value: '',
              placeholder: 'Suisse'
            },
            {
              name: 'contactResponseTime',
              label: 'Délai de réponse',
              type: 'text',
              value: '',
              placeholder: 'Sous 24-48 heures'
            }
          ]
        },
        {
          id: 'whyChooseUs',
          title: 'Pourquoi nous choisir ?',
          fields: [
            {
              name: 'whyChooseUsTitle',
              label: 'Titre de la section',
              type: 'text',
              value: '',
              placeholder: 'Pourquoi nous choisir ?'
            },
            {
              name: 'whyChooseUsPoint1',
              label: 'Point 1',
              type: 'text',
              value: '',
              placeholder: 'Formations certifiantes'
            },
            {
              name: 'whyChooseUsPoint2',
              label: 'Point 2',
              type: 'text',
              value: '',
              placeholder: 'Support personnalisé'
            },
            {
              name: 'whyChooseUsPoint3',
              label: 'Point 3',
              type: 'text',
              value: '',
              placeholder: 'Flexibilité d\'apprentissage'
            }
          ]
        },
        {
          id: 'faq',
          title: 'Questions Fréquentes (FAQ)',
          fields: [
            {
              name: 'faqTitle',
              label: 'Titre de la section FAQ',
              type: 'text',
              value: '',
              placeholder: 'Questions fréquentes'
            },
            {
              name: 'faqQuestion1',
              label: 'Question 1',
              type: 'text',
              value: '',
              placeholder: 'Première question fréquente'
            },
            {
              name: 'faqAnswer1',
              label: 'Réponse 1',
              type: 'textarea',
              value: '',
              placeholder: 'Réponse à la première question'
            },
            {
              name: 'faqQuestion2',
              label: 'Question 2',
              type: 'text',
              value: '',
              placeholder: 'Deuxième question fréquente'
            },
            {
              name: 'faqAnswer2',
              label: 'Réponse 2',
              type: 'textarea',
              value: '',
              placeholder: 'Réponse à la deuxième question'
            },
            {
              name: 'faqQuestion3',
              label: 'Question 3',
              type: 'text',
              value: '',
              placeholder: 'Troisième question fréquente'
            },
            {
              name: 'faqAnswer3',
              label: 'Réponse 3',
              type: 'textarea',
              value: '',
              placeholder: 'Réponse à la troisième question'
            },
            {
              name: 'faqQuestion4',
              label: 'Question 4',
              type: 'text',
              value: '',
              placeholder: 'Quatrième question fréquente'
            },
            {
              name: 'faqAnswer4',
              label: 'Réponse 4',
              type: 'textarea',
              value: '',
              placeholder: 'Réponse à la quatrième question'
            }
          ]
        }
      ]
    }
  ];

  // Load content when a page is selected
  useEffect(() => {
    if (selectedPage) {
      const page = pageOptions.find(p => p.id === selectedPage);
      console.log('Selected page:', selectedPage);
      console.log('Found page:', page);
      console.log('Page sections:', page?.sections);
      if (page) {
        setSections(page.sections);
        loadExistingContent(page.id);
      }
    }
  }, [selectedPage]);

  const loadExistingContent = async (pageId: string) => {
    try {
      const existingContent = await contentService.getContent();
      const page = pageOptions.find(p => p.id === pageId);
      if (page) {
        const updatedSections = page.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => ({
            ...field,
            value: existingContent[field.name as keyof WebsiteContent] || ''
          }))
        }));
        setSections(updatedSections);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const contentToSave = sections.reduce((acc, section) => {
        section.fields.forEach(field => {
          acc[field.name] = field.value;
        });
        return acc;
      }, {} as Record<string, string>);

      await contentService.updateFields(contentToSave);
      setSaveStatus('saved');
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (sectionId: string, fieldName: string, value: string) => {
    setSections(prev => prev.map(section => 
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
    ));
  };

  if (selectedPage) {
    const page = pageOptions.find(p => p.id === selectedPage);
    if (!page) return null;
    
    console.log('Rendering page:', page.title);
    console.log('Page sections count:', page.sections.length);
    console.log('Current sections state:', sections.length);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Administration HelvetiForma</h1>
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <span className="text-2xl">×</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="#" 
              onClick={() => setSelectedPage(null)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Retour à la sélection des pages
            </Link>
            <Link 
              href="/admin/dashboard" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Retour au dashboard
            </Link>
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Modifier : {page.title}
            </h2>
            <p className="text-gray-600 mb-6">{page.description}</p>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`mb-8 px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sauvegarde...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-1v5.586l-2.293-2.293z"/>
                  </svg>
                  Sauvegarder
                </span>
              )}
            </button>

            {/* Save Status */}
            {saveStatus === 'saved' && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ Contenu sauvegardé avec succès !
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ Erreur lors de la sauvegarde. Veuillez réessayer.
              </div>
            )}

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : field.type === 'html' ? (
                          <textarea
                            value={field.value}
                            onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                            placeholder={field.placeholder}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration HelvetiForma</h1>
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <Link 
            href="/admin/dashboard" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {/* Page Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageOptions.map((page) => (
            <div
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{page.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-500">{page.sections.length} section{page.sections.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{page.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 