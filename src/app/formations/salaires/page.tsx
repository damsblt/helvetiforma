'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';
import { contentService, WebsiteContent } from '@/services/contentService';
import EditableContent from '@/components/EditableContent';

export default function SalairesFormationPage() {
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-blue-600">Accueil</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/formations" className="hover:text-blue-600">Formations</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium">Gestion des Salaires</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">💰</div>
          <EditableContent
            fieldName="formationSalairesTitle"
            value={content.formationSalairesTitle}
            type="text"
            placeholder="Titre de la formation salaires"
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-gray-900">
              {content.formationSalairesTitle}
            </h1>
          </EditableContent>
          
          <EditableContent
            fieldName="formationSalairesDescription"
            value={content.formationSalairesDescription}
            type="textarea"
            placeholder="Description de la formation salaires"
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-xl text-gray-600">
              {content.formationSalairesDescription}
            </p>
          </EditableContent>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <EditableContent
                fieldName="formationSalairesDuration"
                value={content.formationSalairesDuration}
                type="text"
                placeholder="Durée de la formation"
                className="inline"
              >
                <span>{content.formationSalairesDuration}</span>
              </EditableContent>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <EditableContent
                fieldName="formationSalairesLevel"
                value={content.formationSalairesLevel}
                type="text"
                placeholder="Niveau de la formation"
                className="inline"
              >
                <span>{content.formationSalairesLevel}</span>
              </EditableContent>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              <EditableContent
                fieldName="formationSalairesPrice"
                value={content.formationSalairesPrice}
                type="text"
                placeholder="Prix de la formation"
                className="inline"
              >
                <span>{content.formationSalairesPrice}</span>
              </EditableContent>
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <EditableContent
                fieldName="formationSalairesParticipants"
                value={content.formationSalairesParticipants}
                type="text"
                placeholder="Nombre de participants"
                className="inline"
              >
                <span>{content.formationSalairesParticipants}</span>
              </EditableContent>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Aperçu de la Formation</h2>
              <EditableContent
                fieldName="formationSalairesOverview"
                value={content.formationSalairesOverview}
                type="textarea"
                placeholder="Aperçu de la formation salaires"
                className="mb-4"
              >
                <p className="text-gray-700">
                  {content.formationSalairesOverview}
                </p>
              </EditableContent>
            </div>



            {/* Key Concepts */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Concepts Clés de la Gestion des Salaires</h2>
              
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationSalairesKeyConcept1Title"
                      value={content.formationSalairesKeyConcept1Title}
                      type="text"
                      placeholder="Titre du concept 1"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-blue-900">
                        {content.formationSalairesKeyConcept1Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationSalairesKeyConcept1Description"
                      value={content.formationSalairesKeyConcept1Description}
                      type="textarea"
                      placeholder="Description du concept 1"
                    >
                      <p className="text-blue-800 text-sm">
                        {content.formationSalairesKeyConcept1Description}
                      </p>
                    </EditableContent>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationSalairesKeyConcept2Title"
                      value={content.formationSalairesKeyConcept2Title}
                      type="text"
                      placeholder="Titre du concept 2"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-green-900">
                        {content.formationSalairesKeyConcept2Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationSalairesKeyConcept2Description"
                      value={content.formationSalairesKeyConcept2Description}
                      type="textarea"
                      placeholder="Description du concept 2"
                    >
                      <p className="text-green-800 text-sm">
                        {content.formationSalairesKeyConcept2Description}
                      </p>
                    </EditableContent>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationSalairesKeyConcept3Title"
                      value={content.formationSalairesKeyConcept3Title}
                      type="text"
                      placeholder="Titre du concept 3"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-purple-900">
                        {content.formationSalairesKeyConcept3Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationSalairesKeyConcept3Description"
                      value={content.formationSalairesKeyConcept3Description}
                      type="textarea"
                      placeholder="Description du concept 3"
                    >
                      <p className="text-purple-800 text-sm">
                        {content.formationSalairesKeyConcept3Description}
                      </p>
                    </EditableContent>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationSalairesKeyConcept4Title"
                      value={content.formationSalairesKeyConcept4Title}
                      type="text"
                      placeholder="Titre du concept 4"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-orange-900">
                        {content.formationSalairesKeyConcept4Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationSalairesKeyConcept4Description"
                      value={content.formationSalairesKeyConcept4Description}
                      type="textarea"
                      placeholder="Description du concept 4"
                    >
                      <p className="text-orange-800 text-sm">
                        {content.formationSalairesKeyConcept4Description}
                      </p>
                    </EditableContent>
                  </div>
                </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Objectifs d'Apprentissage</h2>
              <EditableContent
                fieldName="formationSalairesObjectives"
                value={content.formationSalairesObjectives}
                type="textarea"
                placeholder="Objectifs d'apprentissage de la formation"
                className="mb-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {content.formationSalairesObjectives.split('\n').map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{objective}</span>
                    </div>
                  ))}
                </div>
              </EditableContent>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Prêt à Commencer ?</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Inscrivez-vous à cette formation et développez vos compétences en gestion des salaires.
                </p>
              </div>
              
              <CalendarLink
                theme="Salaire"
                className="group relative inline-flex items-center justify-center w-full bg-white text-blue-600 py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-blue-600 hover:text-white border-2 border-white hover:border-white"
              >
                <span className="flex items-center space-x-2">
                  <span>Voir les dates</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </CalendarLink>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Public Cible</h3>
              <EditableContent
                fieldName="formationSalairesTargetAudience"
                value={content.formationSalairesTargetAudience}
                type="textarea"
                placeholder="Public cible de la formation"
                className="mb-4"
              >
                <ul className="space-y-2 text-sm text-gray-700">
                  {content.formationSalairesTargetAudience.split('\n').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </EditableContent>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prérequis</h3>
              <EditableContent
                fieldName="formationSalairesPrerequisites"
                value={content.formationSalairesPrerequisites}
                type="textarea"
                placeholder="Prérequis de la formation"
                className="mb-4"
              >
                <ul className="space-y-2 text-sm text-gray-700">
                  {content.formationSalairesPrerequisites.split('\n').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </EditableContent>
            </div>

            {/* Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inclus dans la Formation</h3>
              <EditableContent
                fieldName="formationSalairesIncluded"
                value={content.formationSalairesIncluded}
                type="textarea"
                placeholder="Ce qui est inclus dans la formation"
                className="mb-4"
              >
                <ul className="space-y-2 text-sm text-gray-700">
                  {content.formationSalairesIncluded.split('\n').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </EditableContent>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <EditableContent
              fieldName="formationSalairesCtaTitle"
              value={content.formationSalairesCtaTitle}
              type="text"
              placeholder="Titre de l'appel à l'action"
              className="mb-4"
            >
              <h2 className="text-2xl font-bold">
                {content.formationSalairesCtaTitle}
              </h2>
            </EditableContent>
            
            <EditableContent
              fieldName="formationSalairesCtaDescription"
              value={content.formationSalairesCtaDescription}
              type="textarea"
              placeholder="Description de l'appel à l'action"
              className="mb-6 max-w-2xl mx-auto"
            >
              <p className="text-blue-100">
                {content.formationSalairesCtaDescription}
              </p>
            </EditableContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendarLink
                theme="Salaire"
                className="group relative inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-blue-600 hover:text-white border-2 border-white hover:border-white"
              >
                <span className="flex items-center space-x-2">
                  <span>Voir les dates</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </CalendarLink>
              <Link
                href="/formations"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Voir toutes les formations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
