'use client';

import React, { useState } from 'react';

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to render rich text content
const renderRichText = (content: string) => {
  if (!content) return null;
  
  // Simple rich text rendering - you might want to use a proper rich text renderer
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default function FormationDocViewer({ 
  title, 
  description, 
  image, 
  dynamicZone 
}: { 
  title: string; 
  description?: string; 
  image?: any; 
  dynamicZone?: any[] 
}) {
  const [isViewing, setIsViewing] = useState(false);

  const openViewer = () => {
    console.log('Opening formation-doc viewer for:', title);
    setIsViewing(true);
  };

  const closeViewer = () => {
    setIsViewing(false);
  };

  // Function to render dynamic zone components
  const renderDynamicZone = (components: any[]) => {
    if (!components || components.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">Aucun contenu dynamique disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {components.map((component: any, index: number) => {
          // YouTube Video Component
          if (component.__component === 'video.youtube-video') {
            const videoId = getYouTubeVideoId(component.youtubeUrl);
            
            return (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">🎥 Vidéo YouTube</h3>
                <div className="space-y-4">
                  {component.title && (
                    <h4 className="text-lg font-medium text-gray-800">{component.title}</h4>
                  )}
                  
                  {videoId ? (
                    <div className={`relative ${component.width === 'full' ? 'w-full' : component.width === 'small' ? 'max-w-md' : 'max-w-2xl'}`}>
                      <div className="relative pb-[56.25%] h-0">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=${component.autoplay ? 1 : 0}&controls=${component.showControls ? 1 : 0}`}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      ❌ URL YouTube invalide: {component.youtubeUrl}
                    </div>
                  )}
                  
                  {component.description && (
                    <div className="mt-4">
                      {renderRichText(component.description)}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Image-First Component
          if (component.__component === 'image-first.image-text') {
            const hasImageData = component.image1 && component.image1.url;
            const layout = component.layout || 'image-text';
            
            return (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">📷 Image + Texte</h3>
                <div className={`space-y-4 ${layout === 'side-by-side' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                  {hasImageData ? (
                    <div className={layout === 'text-image' ? 'order-2' : ''}>
                      <img
                        src={`https://api.helvetiforma.ch${component.image1.url}`}
                        alt={component.image1.alternativeText || component.image1.name}
                        className={`rounded-lg shadow-sm ${layout === 'full-width-image' ? 'w-full' : 'max-w-full'}`}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      📷 <strong>Image disponible dans WordPress</strong> - L'image est configurée mais nécessite une population API spécifique
                    </div>
                  )}
                  
                  {component.text1 && (
                    <div className={layout === 'text-image' ? 'order-1' : ''}>
                      {renderRichText(component.text1)}
                    </div>
                  )}
                  
                  {component.youtubeUrl && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">🎥 Vidéo associée</h4>
                      {(() => {
                        const videoId = getYouTubeVideoId(component.youtubeUrl);
                        return videoId ? (
                          <div className="relative pb-[56.25%] h-0">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                            URL YouTube invalide
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          
          // Text-First Component
          if (component.__component === 'text-first.text-image') {
            const hasImageData = component.image && component.image.url;
            const layout = component.layout || 'text-image';
            
            return (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">📝 Texte + Image</h3>
                <div className={`space-y-4 ${layout === 'side-by-side' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                  {component.text && (
                    <div className={layout === 'image-text' ? 'order-2' : ''}>
                      {renderRichText(component.text)}
                    </div>
                  )}
                  
                  {hasImageData ? (
                    <div className={layout === 'image-text' ? 'order-1' : ''}>
                      <img
                        src={`https://api.helvetiforma.ch${component.image.url}`}
                        alt={component.image.alternativeText || component.image.name}
                        className={`rounded-lg shadow-sm ${layout === 'full-width-text' ? 'max-w-md' : 'max-w-full'}`}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      📷 <strong>Image disponible dans WordPress</strong> - L'image est configurée mais nécessite une population API spécifique
                    </div>
                  )}
                  
                  {component.youtubeUrl && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">🎥 Vidéo associée</h4>
                      {(() => {
                        const videoId = getYouTubeVideoId(component.youtubeUrl);
                        return videoId ? (
                          <div className="relative pb-[56.25%] h-0">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                            URL YouTube invalide
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          
          return (
            <div key={index} className="border-l-4 border-gray-300 pl-4">
              <p className="text-gray-600">Composant: {component.__component}</p>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isViewing) {
    return (
      <div>
        <button
          onClick={openViewer}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          📄 Voir en plein écran
        </button>
        
        {/* Document preview info */}
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
          <p><strong>Document:</strong> {title}</p>
          <p className="mt-1">Consultation en plein écran - Contenu dynamique</p>
          <p className="mt-1 text-xs text-gray-500">
            💡 Affiche le contenu dans une modal plein écran avec vidéos YouTube.
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
            <p className="text-sm text-gray-600 mt-1">Document de formation</p>
          </div>
          <button
            onClick={closeViewer}
            className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Description */}
          {description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              {renderRichText(description)}
            </div>
          )}

          {/* Main Image */}
          {image && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Image principale</h3>
              <img
                src={`https://api.helvetiforma.ch${image.url}`}
                alt={image.alternativeText || image.name}
                className="w-full max-w-2xl h-auto rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Dynamic Zone Content */}
          {dynamicZone && dynamicZone.length > 0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contenu dynamique</h3>
              {renderDynamicZone(dynamicZone)}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun contenu dynamique disponible</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            📄 Consultation en plein écran - Contenu dynamique avec vidéos YouTube
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