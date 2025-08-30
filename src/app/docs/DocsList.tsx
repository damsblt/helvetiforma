'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface Article {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any;
  categories: number[];
  tags: number[];
  link: string;
  guid: any;
  status: string;
  type: string;
}

export default function DocsList({ articles, categories }: { articles: Article[]; categories: string[] }) {
  const [selected, setSelected] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredArticles = articles.filter((article) => {
    if (selected === 'Toutes') return true;
    
    // Get category map from window (set in parent component)
    const categoryMap = (window as any).categoryMap;
    if (!categoryMap) return true;
    
    // Check if article has the selected category
    return article.categories.some((catId: number) => {
      const categoryName = categoryMap.get(catId);
      return categoryName === selected;
    });
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      comparison = dateA - dateB;
    } else if (sortBy === 'title') {
      comparison = a.title.rendered.localeCompare(b.title.rendered, 'fr');
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    // First decode HTML entities
    const decoded = html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&#8230;/g, '…')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&hellip;/g, '…')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–');
    
    // Then remove HTML tags
    return decoded.replace(/<[^>]*>/g, '');
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coin des Docs</h1>
          <p className="text-gray-600">Bibliothèque d'articles et ressources</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Filter */}
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          {/* Sort By */}
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
          >
            <option value="date">Trier par date</option>
            <option value="title">Trier par titre</option>
          </select>
          
          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            title={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
          >
            {sortOrder === 'asc' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
          <p className="text-gray-500">Aucun article ne correspond à la catégorie sélectionnée.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {sortedArticles.length} article{sortedArticles.length !== 1 ? 's' : ''} trouvé{sortedArticles.length !== 1 ? 's' : ''}
            {selected !== 'Toutes' && ` dans la catégorie "${selected}"`}
          </div>
          
          <div className="grid gap-6">
            {sortedArticles.map((article) => {
              const cleanExcerpt = article.excerpt ? stripHtml(article.excerpt.rendered) : '';
              const cleanContent = article.content ? stripHtml(article.content.rendered) : '';

              return (
                <article key={article.id} className="article-preview-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {article.title.rendered}
                        </h2>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Article
                          </span>
                        </div>
                      </div>

                      {/* Article Status */}
                      <div className="status-tags">
                        <span className="status-tag bg-blue-100 text-blue-800">
                          {article.status}
                        </span>
                        <span className="status-tag bg-purple-100 text-purple-800">
                          {article.format}
                        </span>
                        {article.sticky && (
                          <span className="status-tag bg-yellow-100 text-yellow-800">
                            Épinglé
                          </span>
                        )}
                      </div>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {cleanExcerpt || cleanContent || 'Aucun extrait disponible pour cet article.'}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="metadata">
                          <span>📅 {article.date ? formatDate(article.date) : 'Date inconnue'}</span>
                          <span>✏️ {article.modified ? formatDate(article.modified) : 'Non modifié'}</span>
                          <span>🔗 {article.slug}</span>
                        </div>
                        
                        <div className="action-buttons">
                          <Link
                            href={`/docs/${article.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Lire l'article
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}


    </>
  );
} 