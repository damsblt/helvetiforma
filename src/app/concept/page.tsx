'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { contentService, WebsiteContent } from '@/services/contentService';
import EditableContent from '@/components/EditableContent';

export default function ConceptPage() {
  const [content, setContent] = useState<WebsiteContent | null>(null);

  useEffect(() => {
    // Load content from the content service
    setContent(contentService.getContent());
    
    // Listen for content changes (when admin updates content)
    const handleStorageChange = () => {
      setContent(contentService.getContent());
    };
    
    // Listen for custom content update events
    const handleContentUpdate = () => {
      setContent(contentService.getContent());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contentUpdated', handleContentUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du contenu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableContent
            fieldName="conceptTitle"
            value={content.conceptTitle}
            type="text"
            placeholder="Titre de la page concept"
            className="mb-4"
          >
            <h1 className="text-4xl font-bold text-gray-900">
              {content.conceptTitle}
            </h1>
          </EditableContent>
          
          <EditableContent
            fieldName="conceptSubtitle"
            value={content.conceptSubtitle}
            type="text"
            placeholder="Sous-titre de la page concept"
            className="max-w-2xl mx-auto"
          >
            <p className="text-xl text-gray-600">
              {content.conceptSubtitle}
            </p>
          </EditableContent>
        </div>

        {/* Blended Learning Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <EditableContent
                fieldName="conceptContent"
                value={content.conceptContent}
                type="textarea"
                placeholder="Contenu principal de la page concept"
                className="mb-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900">
                  Apprentissage hybride (Blended Learning)
                </h2>
              </EditableContent>
              
              <div className="space-y-4">
                <EditableContent
                  fieldName="conceptContent"
                  value={content.conceptContent}
                  type="textarea"
                  placeholder="Contenu principal de la page concept"
                  className="mb-4"
                >
                  <p className="text-lg text-gray-700 font-medium">
                    Notre approche révolutionne la formation en combinant deux modalités d'apprentissage :
                  </p>
                </EditableContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Formation à distance</h3>
                      <p className="text-gray-600">Modules en ligne flexibles et accessibles 24h/24</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sessions en présentiel</h3>
                      <p className="text-gray-600">Validation des acquis et pratique avec nos formateurs experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Formation hybride</h3>
              <p className="text-sm text-gray-600">Le meilleur des deux mondes</p>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notre philosophie</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Apprendre avec plaisir</h3>
              <EditableContent
                fieldName="conceptPhilosophy"
                value={content.conceptPhilosophy}
                type="textarea"
                placeholder="Contenu de la philosophie"
                className="mb-3"
              >
                <p className="text-gray-700 leading-relaxed">
                  {content.conceptPhilosophy}
                </p>
              </EditableContent>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Approche personnalisée</h4>
                <EditableContent
                  fieldName="conceptPersonalizedApproach"
                  value={content.conceptPersonalizedApproach}
                  type="textarea"
                  placeholder="Contenu de l'approche personnalisée"
                  className="mb-3"
                >
                  <p className="text-gray-600">
                    {content.conceptPersonalizedApproach}
                  </p>
                </EditableContent>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Validation des compétences</h4>
                <EditableContent
                  fieldName="conceptSkillsValidation"
                  value={content.conceptSkillsValidation}
                  type="textarea"
                  placeholder="Contenu de la validation des compétences"
                  className="mb-3"
                >
                  <p className="text-gray-600">
                    {content.conceptSkillsValidation}
                  </p>
                </EditableContent>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Avantages de notre approche</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Flexibilité maximale</h3>
                  <p className="text-gray-600">Apprenez à votre rythme, où et quand vous voulez</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Suivi personnalisé</h3>
                  <p className="text-gray-600">Accompagnement sur mesure avec nos formateurs experts</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ressources de qualité</h3>
                  <p className="text-gray-600">Contenu pédagogique créé par des experts du domaine</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Certification reconnue</h3>
                  <p className="text-gray-600">Diplômes et certificats valorisés par les employeurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Concept Features Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Fonctionnalités de notre concept
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.conceptFeatures.split('\n').map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{feature.replace('• ', '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Prêt à commencer votre formation ?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Découvrez nos formations spécialisées et commencez votre parcours d'apprentissage 
            dès aujourd'hui avec notre approche hybride innovante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/formations" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-lg"
            >
              Consulter les formations
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 