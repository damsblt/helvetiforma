'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Session {
  id: number;
  attributes: {
    date: string;
    formation?: {
      id: number;
      attributes: {
        Title: string;
        Theme: string;
      };
    };
  };
}

interface InPersonSubscriptionProps {
  formationSlug: string;
  formationTitle: string;
}

const InPersonSubscription: React.FC<InPersonSubscriptionProps> = ({
  formationSlug,
  formationTitle
}) => {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingSessions();
  }, [formationSlug]);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/formations?populate=*');
      if (response.ok) {
        const data = await response.json();
        const formations = data.data || [];
        
        // Find the formation by slug
        const formation = formations.find((f: any) => f.attributes.Theme === formationSlug);
        
        if (formation && formation.attributes.sessions) {
          const now = new Date();
          const upcoming = formation.attributes.sessions
            .filter((session: any) => new Date(session.attributes.date) > now)
            .sort((a: any, b: any) => new Date(a.attributes.date).getTime() - new Date(b.attributes.date).getTime())
            .slice(0, 4); // Show next 4 sessions
          
          setUpcomingSessions(upcoming);
        }
      }
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">inPerson</h2>
      
      <div className="space-y-4">
        {/* Prochaines dates section */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Prochaines dates</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Chargement des sessions...</span>
            </div>
          ) : upcomingSessions.length > 0 ? (
            <>
              {/* Next upcoming session - highlighted */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Prochaine session disponible</p>
                    <p className="text-xs text-green-600">
                      {formatDate(upcomingSessions[0].attributes.date)} - {formatTime(upcomingSessions[0].attributes.date)}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Additional sessions */}
              {upcomingSessions.length > 1 && (
                <div className="space-y-2 mb-4">
                  {upcomingSessions.slice(1).map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                      <span className="text-sm text-gray-700">
                        {formatDate(session.attributes.date)} - {formatTime(session.attributes.date)}
                      </span>
                      <span className="text-xs text-gray-500">Disponible</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
              <p className="text-sm text-yellow-800">Aucune session programmée pour le moment</p>
              <p className="text-xs text-yellow-600 mt-1">Les prochaines dates seront bientôt annoncées</p>
            </div>
          )}
          
        </div>
        
        {/* Subscription button - now links to calendar */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <Link
            href={`/calendar?category=${formationSlug}`}
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
          >
            S'inscrire à la formation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InPersonSubscription;
