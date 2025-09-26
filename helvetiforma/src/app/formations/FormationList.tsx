'use client';
import React from 'react';
import Link from 'next/link';

function formatDate(dateString?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-CH', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function FormationList({ formations }: { formations: any[] }) {
  return (
    <div className="space-y-4">
        {formations.map((formation: any) => {
        const title = formation.Title || 'Formation sans titre';
        const description = formation.Description || '';
        const type = formation.Type || 'en ligne';
        const sessions = formation.sessions || [];
        const docs = formation.docs || [];

          return (
          <Link 
            href={`/formations/${formation.id}`} 
            key={formation.id}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
                {description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    type === 'en ligne' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {type}
                  </span>
                  {sessions.length > 0 && (
                    <span className="flex items-center gap-1">
                      📅 {sessions.length} session{sessions.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {docs.length > 0 && (
                    <span className="flex items-center gap-1">
                      📚 {docs.length} ressource{docs.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
  );
} 