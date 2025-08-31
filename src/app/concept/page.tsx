'use client';

import React, { useEffect, useState } from 'react';
import { contentService, WebsiteContent } from '@/services/contentService';

export default function Concept() {
  const [content, setContent] = useState<WebsiteContent | null>(null);

  useEffect(() => {
    // Load content from the content service
    setContent(contentService.getContent());
    
    // Listen for content changes (when admin updates content)
    const handleStorageChange = () => {
      setContent(contentService.getContent());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {content.conceptTitle}
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            {content.conceptSubtitle}
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg mx-auto text-center mb-16">
              <p className="text-xl text-gray-600 leading-relaxed">
                {content.conceptContent}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Formation en ligne flexible</h3>
                <p className="text-gray-600">
                  Apprenez à votre rythme avec nos modules interactifs disponibles 24h/24 et 7j/7.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sessions en présentiel</h3>
                <p className="text-gray-600">
                  Bénéficiez d'un accompagnement personnalisé lors de nos sessions pratiques.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Suivi personnalisé</h3>
                <p className="text-gray-600">
                  Un accompagnement sur mesure avec nos formateurs experts et notre équipe dédiée.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Certificats reconnus</h3>
                <p className="text-gray-600">
                  Obtenez des certificats qui attestent de vos compétences et valorisent votre CV.
                </p>
              </div>
            </div>

            {/* Concept Features */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
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
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à découvrir notre concept ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de professionnels qui ont déjà choisi Helvetiforma pour leur formation continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/formations"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Découvrir nos formations
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 