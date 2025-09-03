'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';
import { contentService, WebsiteContent } from '@/services/contentService';
import EditableContent from '@/components/EditableContent';

export default function ChargesSocialesFormationPage() {
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
            <li className="text-gray-900 font-medium">Charges Sociales & Cotisations</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🏢</div>
          <EditableContent
            fieldName="formationChargesTitle"
            value={content.formationChargesTitle}
            type="text"
            placeholder="Titre de la formation charges sociales"
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-gray-900">
              {content.formationChargesTitle}
            </h1>
          </EditableContent>
          
          <EditableContent
            fieldName="formationChargesDescription"
            value={content.formationChargesDescription}
            type="textarea"
            placeholder="Description de la formation charges sociales"
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-xl text-gray-600">
              {content.formationChargesDescription}
            </p>
          </EditableContent>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>2 jours</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <span>Niveau Avancé</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              <span>CHF 980</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>Max 10 participants</span>
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
                fieldName="formationChargesOverview"
                value={content.formationChargesOverview}
                type="textarea"
                placeholder="Aperçu de la formation charges sociales"
                className="mb-4"
              >
                <p className="text-gray-700">
                  {content.formationChargesOverview}
                </p>
              </EditableContent>
            </div>



            {/* Key Concepts */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Concepts Clés des Charges Sociales</h2>
              
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationChargesKeyConcept1Title"
                      value={content.formationChargesKeyConcept1Title}
                      type="text"
                      placeholder="Titre du concept 1"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-blue-900">
                        {content.formationChargesKeyConcept1Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationChargesKeyConcept1Description"
                      value={content.formationChargesKeyConcept1Description}
                      type="textarea"
                      placeholder="Description du concept 1"
                    >
                      <p className="text-blue-800 text-sm">
                        {content.formationChargesKeyConcept1Description}
                      </p>
                    </EditableContent>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationChargesKeyConcept2Title"
                      value={content.formationChargesKeyConcept2Title}
                      type="text"
                      placeholder="Titre du concept 2"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-green-900">
                        {content.formationChargesKeyConcept2Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationChargesKeyConcept2Description"
                      value={content.formationChargesKeyConcept2Description}
                      type="textarea"
                      placeholder="Description du concept 2"
                    >
                      <p className="text-green-800 text-sm">
                        {content.formationChargesKeyConcept2Description}
                      </p>
                    </EditableContent>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationChargesKeyConcept3Title"
                      value={content.formationChargesKeyConcept3Title}
                      type="text"
                      placeholder="Titre du concept 3"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-purple-900">
                        {content.formationChargesKeyConcept3Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationChargesKeyConcept3Description"
                      value={content.formationChargesKeyConcept3Description}
                      type="textarea"
                      placeholder="Description du concept 3"
                    >
                      <p className="text-purple-800 text-sm">
                        {content.formationChargesKeyConcept3Description}
                      </p>
                    </EditableContent>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6">
                    <EditableContent
                      fieldName="formationChargesKeyConcept4Title"
                      value={content.formationChargesKeyConcept4Title}
                      type="text"
                      placeholder="Titre du concept 4"
                      className="mb-3"
                    >
                      <h3 className="text-lg font-semibold text-orange-900">
                        {content.formationChargesKeyConcept4Title}
                      </h3>
                    </EditableContent>
                    <EditableContent
                      fieldName="formationChargesKeyConcept4Description"
                      value={content.formationChargesKeyConcept4Description}
                      type="textarea"
                      placeholder="Description du concept 4"
                    >
                      <p className="text-orange-800 text-sm">
                        {content.formationChargesKeyConcept4Description}
                      </p>
                    </EditableContent>
                  </div>
                </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Objectifs d'Apprentissage</h2>
              <EditableContent
                fieldName="formationChargesObjectives"
                value={content.formationChargesObjectives}
                type="textarea"
                placeholder="Objectifs d'apprentissage de la formation"
                className="mb-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {content.formationChargesObjectives.split('\n').map((objective, index) => (
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
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Prêt à Commencer ?</h3>
                <p className="text-green-100 text-lg leading-relaxed">
                  Inscrivez-vous à cette formation et maîtrisez les charges sociales.
                </p>
              </div>
              
              <CalendarLink
                theme="Assurances sociales"
                className="group relative inline-flex items-center justify-center w-full bg-white text-green-600 py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-green-600 hover:text-white border-2 border-white hover:border-white"
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
                fieldName="formationChargesTargetAudience"
                value={content.formationChargesTargetAudience}
                type="textarea"
                placeholder="Public cible de la formation"
                className="mb-4"
              >
                <ul className="space-y-2 text-sm text-gray-700">
                  {content.formationChargesTargetAudience.split('\n').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </EditableContent>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prérequis</h3>
              <EditableContent
                fieldName="formationChargesPrerequisites"
                value={content.formationChargesPrerequisites}
                type="textarea"
                placeholder="Prérequis de la formation"
                className="mb-4"
              >
                <ul className="space-y-2 text-sm text-gray-700">
                  {content.formationChargesPrerequisites.split('\n').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </EditableContent>
            </div>

            {/* Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inclus dans la Formation</h3>
              <EditableContent
                fieldName="formationChargesIncluded"
                value={content.formationChargesIncluded}
                type="textarea"
                placeholder="Ce qui est inclus dans la formation"
                className="mb-4"
              >
                <ul className="space-y-2 text-sm text-gray-700">
                  {content.formationChargesIncluded.split('\n').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </EditableContent>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <EditableContent
              fieldName="formationChargesCtaTitle"
              value={content.formationChargesCtaTitle}
              type="text"
              placeholder="Titre de l'appel à l'action"
              className="mb-4"
            >
              <h2 className="text-2xl font-bold">
                {content.formationChargesCtaTitle}
              </h2>
            </EditableContent>
            
            <EditableContent
              fieldName="formationChargesCtaDescription"
              value={content.formationChargesCtaDescription}
              type="textarea"
              placeholder="Description de l'appel à l'action"
              className="mb-6 max-w-2xl mx-auto"
            >
              <p className="text-green-100">
                {content.formationChargesCtaDescription}
              </p>
            </EditableContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendarLink
                theme="Assurances sociales"
                className="bg-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <span className="text-green-600 hover:text-white">Voir les dates</span>
              </CalendarLink>
              <Link
                href="/formations"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
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
