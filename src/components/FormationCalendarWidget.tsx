'use client';

import React, { useState, useEffect } from 'react';
import FormationCalendar from './FormationCalendar';

interface Formation {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Type: 'Présentiel' | 'En ligne';
    Theme: 'Salaire' | 'Assurances sociales' | 'Impôt à la source';
    difficulty: string;
    estimatedDuration: number;
    sessions?: Session[];
  };
}

interface Session {
  id: number;
  attributes: {
    date: string;
    formation?: Formation;
  };
}

interface FormationCalendarWidgetProps {
  formation: Formation;
  height?: string;
}

const FormationCalendarWidget: React.FC<FormationCalendarWidgetProps> = ({
  formation,
  height = '400px',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!formation.attributes.sessions || formation.attributes.sessions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session programmée</h3>
        <p className="text-gray-600">
          Les sessions pour cette formation seront bientôt programmées.
        </p>
      </div>
    );
  }

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'Salaire':
        return 'bg-green-100 text-green-800';
      case 'Assurances sociales':
        return 'bg-purple-100 text-purple-800';
      case 'Impôt à la source':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Calendrier des Sessions</h3>
            <p className="text-sm text-gray-600">
              {formation.attributes.sessions.length} session{formation.attributes.sessions.length > 1 ? 's' : ''} programmée{formation.attributes.sessions.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Réduire' : 'Voir plus'}
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        <FormationCalendar
          formations={[formation]}
          height={isExpanded ? height : '300px'}
        />
      </div>

      {/* Quick Session List */}
      {!isExpanded && (
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {formation.attributes.sessions
              .sort((a, b) => new Date(a.attributes.date).getTime() - new Date(b.attributes.date).getTime())
              .slice(0, 3)
              .map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      formation.attributes.Type === 'Présentiel' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(session.attributes.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.attributes.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {new Date(new Date(session.attributes.date).getTime() + (formation.attributes.estimatedDuration * 60 * 60 * 1000)).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      formation.attributes.Type === 'Présentiel' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {formation.attributes.Type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getThemeColor(formation.attributes.Theme)}`}>
                      {formation.attributes.Theme}
                    </span>
                  </div>
                </div>
              ))}
            
            {formation.attributes.sessions.length > 3 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir les {formation.attributes.sessions.length - 3} autres sessions
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationCalendarWidget;
