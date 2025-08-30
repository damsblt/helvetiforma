'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';

export default function FormationsPage() {
  const formations = [
    {
      id: 'salaires',
      title: 'Gestion des Salaires',
      description: 'Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. Formation pratique avec cas concrets et outils modernes.',
      duration: '3 jours',
      level: 'Intermédiaire',
      price: 'CHF 1,200',
      icon: '💰',
      color: 'blue',
      features: [
        'Calcul des salaires et avantages',
        'Conformité légale suisse',
        'Outils de gestion RH',
        'Gestion des congés et absences'
      ]
    },
    {
      id: 'charges-sociales',
      title: 'Charges Sociales & Cotisations',
      description: 'Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres assurances sociales en entreprise.',
      duration: '2 jours',
      level: 'Avancé',
      price: 'CHF 980',
      icon: '🏢',
      color: 'green',
      features: [
        'AVS, AI, APG et LPP',
        'Calcul des cotisations',
        'Déclarations sociales',
        'Optimisation fiscale'
      ]
    },
    {
      id: 'impot-a-la-source',
      title: 'Impôt à la Source',
      description: 'Formation spécialisée sur l\'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Procédures et bonnes pratiques.',
      duration: '1.5 jours',
      level: 'Spécialisé',
      price: 'CHF 750',
      icon: '🌍',
      color: 'purple',
      features: [
        'Réglementation suisse',
        'Calcul de l\'impôt à la source',
        'Déclarations fiscales',
        'Cas particuliers frontaliers'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'green':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'purple':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getButtonColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Nos Formations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos formations spécialisées en gestion RH, fiscalité et comptabilité. 
            Des programmes pratiques et professionnels adaptés aux besoins du marché suisse.
          </p>
        </div>

        {/* Formations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {formations.map((formation) => (
            <div
              key={formation.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${getColorClasses(formation.color)}`}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="text-4xl mb-4">{formation.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {formation.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {formation.description}
                </p>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {formation.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Info Bar */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>⏱️ {formation.duration}</span>
                  <span>📊 {formation.level}</span>
                  <span className="font-semibold text-gray-700">{formation.price}</span>
                </div>

                {/* CTA Button */}
                <div className="flex gap-2">
                  <Link
                    href={`/formations/${formation.id}`}
                    className={`flex-1 text-center py-3 px-6 rounded-lg font-medium transition-colors ${getButtonColor(formation.color)}`}
                  >
                    Découvrir la formation
                  </Link>
                  <CalendarLink
                    theme={formation.id === 'salaires' ? 'Salaire' : formation.id === 'charges-sociales' ? 'Assurances sociales' : 'Impôt à la source'}
                    variant="icon"
                    className={`py-3 px-3 rounded-lg font-medium transition-colors ${getButtonColor(formation.color)}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Formation sur Mesure
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nos formations peuvent être adaptées aux besoins spécifiques de votre entreprise. 
            Contactez-nous pour discuter de vos besoins et obtenir un devis personnalisé.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Demander un devis personnalisé
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 