'use client';

import React from 'react';
import Link from 'next/link';
import EditableContent from './EditableContent';
import CalendarLink from './CalendarLink';
import { contentService, WebsiteContent } from '@/services/contentService';

interface Formation {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: string;
  icon: string;
  color: string;
  features: string[];
}

interface EditableFormationCardProps {
  formation: Formation;
  onUpdate?: (updatedFormation: Formation) => void;
}

export default function EditableFormationCard({ formation, onUpdate }: EditableFormationCardProps) {
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

  const handleFieldUpdate = async (fieldName: string, newValue: string) => {
    try {
      // Update the content service
      await contentService.updateField(fieldName as keyof WebsiteContent, newValue);
      
      // Notify parent component if needed
      if (onUpdate) {
        const updatedFormation = {
          ...formation,
          [fieldName.replace(`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}`, '').toLowerCase()]: newValue
        };
        onUpdate(updatedFormation);
      }
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${getColorClasses(formation.color)}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <EditableContent
          fieldName={`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}Icon`}
          value={formation.icon}
          type="text"
          className="text-4xl mb-4"
          onSave={(value) => handleFieldUpdate(`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}Icon`, value)}
        >
          {formation.icon}
        </EditableContent>
        
        <EditableContent
          fieldName={`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}Title`}
          value={formation.title}
          type="text"
          className="text-xl font-bold text-gray-900 mb-2"
          onSave={(value) => handleFieldUpdate(`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}Title`, value)}
        >
          {formation.title}
        </EditableContent>
        
        <div className="text-gray-600 text-sm leading-relaxed">
          {formation.id === 'salaires' && (
            <div>
              Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. Cette formation vous permet d'acquérir une expertise approfondie dans le calcul des rémunérations, la gestion des avantages sociaux et la conformité légale.
            </div>
          )}
          {formation.id === 'charges-sociales' && (
            <div>
              Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres assurances sociales en entreprise. Cette formation approfondie vous donne les clés pour maîtriser le système complexe des cotisations sociales suisses et optimiser la gestion financière de votre organisation.
            </div>
          )}
          {formation.id === 'impot-a-la-source' && (
            <div>
              Formation spécialisée sur l'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Cette formation vous accompagne dans la compréhension des procédures fiscales complexes et des bonnes pratiques pour optimiser votre situation fiscale.
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="p-6">
        <div className="space-y-2 mb-6">
          {formation.features.map((feature, index) => (
            <EditableContent
              key={index}
              fieldName={`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}Feature${index + 1}`}
              value={feature}
              type="text"
              className="flex items-center text-sm text-gray-600"
              onSave={(value) => {
                const updatedFeatures = [...formation.features];
                updatedFeatures[index] = value;
                handleFieldUpdate(`formation${formation.id.charAt(0).toUpperCase() + formation.id.slice(1)}Features`, JSON.stringify(updatedFeatures));
              }}
            >
              <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </EditableContent>
          ))}
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
            theme={formation.id === 'salaires' ? 'salaires' : formation.id === 'charges-sociales' ? 'charges-sociales' : 'impot-a-la-source'}
            variant="icon"
            className={`py-3 px-3 rounded-lg font-medium transition-colors ${getButtonColor(formation.color)}`}
          />
        </div>
      </div>
    </div>
  );
}
