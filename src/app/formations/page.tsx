'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';
import EditableFormationCard from '@/components/EditableFormationCard';
import { contentService } from '@/services/contentService';

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFormations = async () => {
      try {
        const content = await contentService.getContent();
        
        const formationsData = [
          {
            id: 'salaires',
            title: content.formationSalairesCardTitle || 'Gestion des Salaires',
            description: content.formationSalairesCardDescription || 'Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. Formation pratique avec cas concrets et outils modernes.',
            duration: content.formationSalairesCardDuration || '3 jours',
            level: content.formationSalairesCardLevel || 'Intermédiaire',
            price: content.formationSalairesCardPrice || 'CHF 1,200',
            icon: content.formationSalairesIcon || '💰',
            color: 'blue',
            features: [
              content.formationSalairesFeature1 || 'Calcul des salaires et avantages',
              content.formationSalairesFeature2 || 'Conformité légale suisse',
              content.formationSalairesFeature3 || 'Outils de gestion RH',
              content.formationSalairesFeature4 || 'Gestion des congés et absences'
            ]
          },
          {
            id: 'charges-sociales',
            title: content.formationChargesSocialesCardTitle || 'Charges Sociales & Cotisations',
            description: content.formationChargesSocialesCardDescription || 'Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres assurances sociales en entreprise.',
            duration: content.formationChargesSocialesCardDuration || '2 jours',
            level: content.formationChargesSocialesCardLevel || 'Avancé',
            price: content.formationChargesSocialesCardPrice || 'CHF 980',
            icon: content.formationChargesSocialesIcon || '🏢',
            color: 'green',
            features: [
              content.formationChargesSocialesFeature1 || 'AVS, AI, APG et LPP',
              content.formationChargesSocialesFeature2 || 'Calcul des cotisations',
              content.formationChargesSocialesFeature3 || 'Déclarations sociales',
              content.formationChargesSocialesFeature4 || 'Optimisation fiscale'
            ]
          },
          {
            id: 'impot-a-la-source',
            title: content.formationImpotALaSourceCardTitle || 'Impôt à la Source',
            description: content.formationImpotALaSourceCardDescription || 'Formation spécialisée sur l\'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Procédures et bonnes pratiques.',
            duration: content.formationImpotALaSourceCardDuration || '1.5 jours',
            level: content.formationImpotALaSourceCardLevel || 'Spécialisé',
            price: content.formationImpotALaSourceCardPrice || 'CHF 750',
            icon: content.formationImpotALaSourceIcon || '🌍',
            color: 'purple',
            features: [
              content.formationImpotALaSourceFeature1 || 'Réglementation suisse',
              content.formationImpotALaSourceFeature2 || 'Calcul de l\'impôt à la source',
              content.formationImpotALaSourceFeature3 || 'Déclarations fiscales',
              content.formationImpotALaSourceFeature4 || 'Cas particuliers frontaliers'
            ]
          }
        ];
        
        setFormations(formationsData);
      } catch (error) {
        console.error('Error loading formations:', error);
        // Fallback to default data
        setFormations([
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
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormations();
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des formations...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <EditableFormationCard
              key={formation.id}
              formation={formation}
              onUpdate={(updatedFormation) => {
                setFormations(prev => 
                  prev.map(f => f.id === updatedFormation.id ? updatedFormation : f)
                );
              }}
            />
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