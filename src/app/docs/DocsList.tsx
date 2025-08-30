'use client';
import React, { useState } from 'react';

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type?: string;
  Theme?: string;
  totalModules?: number;
  estimatedDuration?: number;
  difficulty?: string;
  price?: number;
  slug?: string;
  date?: string;
  excerpt?: string;
}

export default function DocsList({ docs, categories }: { docs: Formation[]; categories: string[] }) {
  const [selected, setSelected] = useState('Toutes');

  const filteredDocs =
    selected === 'Toutes'
      ? docs
      : docs.filter((doc) => doc.Theme === selected || doc.Type === selected);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coin des Docs</h1>
          <p className="text-gray-600">Bibliothèque de ressources et articles</p>
        </div>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-500">Aucun document ne correspond à la catégorie sélectionnée.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDocs.map((doc) => {
            const cleanExcerpt = doc.excerpt ? stripHtml(doc.excerpt) : '';
            const cleanDescription = doc.Description ? stripHtml(doc.Description) : '';
            const isFree = !doc.price || doc.price === 0;
            const hasMetadata = doc.Type || doc.Theme || doc.difficulty || doc.estimatedDuration;

            return (
              <article key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Article Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {doc.Title}
                      </h2>
                      <div className="flex items-center gap-2 ml-4">
                        {isFree ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Gratuit
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            CHF {doc.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    {hasMetadata && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {doc.Type && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                            {doc.Type}
                          </span>
                        )}
                        {doc.Theme && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                            {doc.Theme}
                          </span>
                        )}
                        {doc.difficulty && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-medium">
                            {doc.difficulty}
                          </span>
                        )}
                        {doc.estimatedDuration && doc.estimatedDuration > 0 && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                            ⏱️ {doc.estimatedDuration} min
                          </span>
                        )}
                        {doc.totalModules && doc.totalModules > 0 && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs font-medium">
                            📚 {doc.totalModules} modules
                          </span>
                        )}
                      </div>
                    )}

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {cleanExcerpt || cleanDescription || 'Aucun extrait disponible pour cet article.'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {doc.date ? formatDate(doc.date) : 'Date inconnue'}</span>
                        {doc.slug && (
                          <span>🔗 {doc.slug}</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          Lire l'article
                        </button>
                        {doc.slug && (
                          <a
                            href={`https://api.helvetiforma.ch/${doc.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            Voir sur WordPress
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Results count */}
      <div className="mt-8 text-center text-gray-500">
        {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} trouvé{filteredDocs.length !== 1 ? 's' : ''}
        {selected !== 'Toutes' && ` dans la catégorie "${selected}"`}
      </div>
    </>
  );
} 