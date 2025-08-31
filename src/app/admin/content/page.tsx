'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contentService, WebsiteContent } from '@/services/contentService';

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
              name: 'aboutContent',
              label: 'Contenu',
              type: 'textarea',
              value: '',
              placeholder: 'Contenu de la section à propos'
            },
            {
              name: 'aboutSubContent',
              label: 'Contenu supplémentaire',
              type: 'textarea',
              value: '',
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
              value: '',
              placeholder: 'Titre de la section fonctionnalités'
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
            },
            {
              name: 'conceptFeatures',
              label: 'Fonctionnalités du concept',
              type: 'textarea',
              value: '',
              placeholder: 'Fonctionnalités du concept (une par ligne)'
            }
          ]
        }
      ]
    },
    {
      id: 'formations',
      title: 'Page Formations',
      description: 'Modifiez le contenu des formations : titres et descriptions des différentes formations disponibles.',
      icon: '📚',
      color: 'purple',
      sections: [
        {
          id: 'formations',
          title: 'Gestion des Formations',
          fields: [
            {
              name: 'formationSalairesTitle',
              label: 'Formation Salaires - Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la formation salaires'
            },
            {
              name: 'formationSalairesDescription',
              label: 'Formation Salaires - Description',
              type: 'textarea',
              value: '',
              placeholder: 'Description de la formation salaires'
            },
            {
              name: 'formationChargesTitle',
              label: 'Formation Charges Sociales - Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la formation charges sociales'
            },
            {
              name: 'formationChargesDescription',
              label: 'Formation Charges Sociales - Description',
              type: 'textarea',
              value: '',
              placeholder: 'Description de la formation charges sociales'
            },
            {
              name: 'formationImpotTitle',
              label: 'Formation Impôt à la Source - Titre',
              type: 'text',
              value: '',
              placeholder: 'Titre de la formation impôt à la source'
            },
            {
              name: 'formationImpotDescription',
              label: 'Formation Impôt à la Source - Description',
              type: 'textarea',
              value: '',
              placeholder: 'Description de la formation impôt à la source'
            }
          ]
        }
      ]
    },
    {
      id: 'contact',
      title: 'Page Contact',
      description: 'Modifiez le contenu de la page contact : titre et description de la section contact.',
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
        }
      ]
    }
  ];

  const handlePageSelect = (pageId: string) => {
    setSelectedPage(pageId);
    const selectedPageOption = pageOptions.find(page => page.id === pageId);
    if (selectedPageOption) {
      // Load existing content for the selected page
      const existingContent = contentService.getContent();
      const sectionsWithContent = selectedPageOption.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => ({
          ...field,
          value: existingContent[field.name as keyof WebsiteContent] || ''
        }))
      }));
      setSections(sectionsWithContent);
    }
  };

  const handleBackToPages = () => {
    setSelectedPage(null);
    setSections([]);
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
      // Get existing content first
      const existingContent = contentService.getContent();
      
      // Create new content data for current page
      const newContentData = sections.reduce((acc, section) => {
        section.fields.forEach(field => {
          acc[field.name] = field.value;
        });
        return acc;
      }, {} as Record<string, string>);
      
      // Merge new content with existing content (don't overwrite other pages)
      const mergedContent = {
        ...existingContent,
        ...newContentData
      };
      
      // Save merged content to localStorage
      localStorage.setItem('websiteContent', JSON.stringify(mergedContent));
      
      // Refresh contentService to ensure consistency
      contentService.refreshContent();
      
      console.log('Content saved successfully:', mergedContent);
      
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

  // Page Selection Interface
  if (!selectedPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Contenu</h1>
            <p className="text-gray-600">
              Choisissez la page que vous souhaitez modifier. Tous les changements sont sauvegardés automatiquement.
            </p>
          </div>

          {/* Page Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {pageOptions.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handlePageSelect(page.id)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mr-4 bg-${page.color}-100`}>
                      {page.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{page.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-4">{page.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {page.sections.length} section{page.sections.length > 1 ? 's' : ''}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Modifier →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Page Editing Interface
  const selectedPageOption = pageOptions.find(page => page.id === selectedPage);
  
  if (!selectedPageOption) {
    return <div>Page non trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToPages}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Retour à la sélection des pages
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modifier : {selectedPageOption.title}
          </h1>
          <p className="text-gray-600">
            {selectedPageOption.description}
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