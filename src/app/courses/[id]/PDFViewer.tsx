'use client';

import React, { useState } from 'react';

export default function PDFViewer({ url, title, article }: { url: string; title: string; article?: any }) {
  const [isViewing, setIsViewing] = useState(false);

  const openViewer = () => {
    console.log('Opening article viewer for:', title);
    setIsViewing(true);
  };

  const closeViewer = () => {
    setIsViewing(false);
  };

  // Function to render article content
  const renderArticleContent = (articleData: any) => {
    if (!articleData) return null;
    
    // If it's a string, render as HTML
    if (typeof articleData === 'string') {
      return (
        <div 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: articleData }}
        />
      );
    }
    
    // If it's an array of blocks
    if (Array.isArray(articleData)) {
      return (
        <div className="text-gray-800 leading-relaxed space-y-4">
          {articleData.map((block: any, index: number) => {
            // Handle different block types
            if (block.type === 'paragraph') {
              return (
                <div key={index} className="mb-4">
                  {block.children?.map((child: any, childIndex: number) => {
                    let text = child.text || '';
                    
                    // Apply formatting based on marks
                    if (child.marks) {
                      child.marks.forEach((mark: string) => {
                        switch (mark) {
                          case 'bold':
                            text = `<strong>${text}</strong>`;
                            break;
                          case 'italic':
                            text = `<em>${text}</em>`;
                            break;
                          case 'underline':
                            text = `<u>${text}</u>`;
                            break;
                        }
                      });
                    }
                    
                    return (
                      <span 
                        key={childIndex}
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    );
                  })}
                </div>
              );
            }
            
            if (block.type === 'heading') {
              const level = block.level || 1;
              const headingContent = block.children?.map((child: any, childIndex: number) => child.text || '').join('');
              
              switch (level) {
                case 1:
                  return <h1 key={index} className="text-2xl font-bold mb-3">{headingContent}</h1>;
                case 2:
                  return <h2 key={index} className="text-xl font-bold mb-3">{headingContent}</h2>;
                case 3:
                  return <h3 key={index} className="text-lg font-bold mb-3">{headingContent}</h3>;
                case 4:
                  return <h4 key={index} className="text-base font-bold mb-3">{headingContent}</h4>;
                case 5:
                  return <h5 key={index} className="text-sm font-bold mb-3">{headingContent}</h5>;
                case 6:
                  return <h6 key={index} className="text-xs font-bold mb-3">{headingContent}</h6>;
                default:
                  return <h1 key={index} className="text-2xl font-bold mb-3">{headingContent}</h1>;
              }
            }
            
            if (block.type === 'list') {
              const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
              return (
                <ListTag key={index} className="list-disc list-inside mb-4 space-y-1">
                  {block.children?.map((listItem: any, itemIndex: number) => (
                    <li key={itemIndex}>
                      {listItem.children?.map((child: any, childIndex: number) => child.text || '').join('')}
                    </li>
                  ))}
                </ListTag>
              );
            }
            
            // Default fallback
            return (
              <p key={index} className="mb-4">
                {block.children?.map((child: any, childIndex: number) => child.text || '').join('')}
              </p>
            );
          })}
        </div>
      );
    }
    
    // If it's an object with blocks property
    if (articleData.blocks) {
      return renderArticleContent(articleData.blocks);
    }
    
    // Fallback: try to stringify and show as plain text
    return (
      <div className="text-gray-800 leading-relaxed">
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(articleData, null, 2)}
        </pre>
      </div>
    );
  };

  if (!isViewing) {
    return (
      <div>
        <button
          onClick={openViewer}
          className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          📄 Consulter le Contenu
        </button>
        
        {/* Document preview info */}
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
          <p><strong>Document:</strong> {title}</p>
          <p className="mt-1">Consultation en ligne - Contenu intégré</p>
          <p className="mt-1 text-xs text-gray-500">
            💡 Le contenu s'affiche directement dans votre navigateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(75, 85, 99, 0.7)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">Contenu intégré</p>
          </div>
          <button
            onClick={closeViewer}
            className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Article Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {article ? (
            <div className="prose prose-lg max-w-none">
              {renderArticleContent(article)}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contenu disponible</h3>
              <p className="text-gray-600">Ce document ne contient pas encore de contenu article.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            📄 Consultation en ligne - Contenu sécurisé
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeViewer}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 