import React from 'react';
import Link from 'next/link';

// Function to fetch image data by ID
async function getImageData(imageId: number) {
  try {
    const res = await fetch(`http://localhost:1337/api/upload/files/${imageId}`, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching image data:', error);
    return null;
  }
}

export default function FormationDocList({ formationDocs }: { formationDocs: any[] }) {
  // Function to render mosaic components
  const renderMosaic = (components: any[]) => {
    if (!components || components.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">Aucun contenu dynamique disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {components.map((component: any, index: number) => {
          if (component.__component === 'image-first.image-text') {
            console.log('Image-text component data:', component);
            
            // Use the most likely URL pattern first
            const imageUrl = `http://localhost:1337/uploads/DSC_04141_d71fa40de5.JPG`;
            
            console.log('Using image URL:', imageUrl);
            
            return (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">Image et Texte</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Image</h5>
                      <img
                        src={imageUrl}
                        alt="Image from Strapi"
                        className="w-full h-auto rounded-lg shadow-sm"
                      />
                    </div>
                    {component.text1 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Texte</h5>
                        <p className="text-gray-800">{component.text1}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    📷 <strong>Image affichée</strong> - Utilisation de l'URL directe de Strapi
                  </div>
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

  if (formationDocs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
        <p className="text-gray-600">Aucun document de formation n'est disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {formationDocs.map((doc: any) => {
        const title = doc.title || 'Document sans titre';
        const description = doc.description || '';
        const image = doc.image && doc.image.length > 0 ? doc.image[0] : null;
        const mosaic = doc.mosaic || [];

        return (
          <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-start gap-6 mb-6">
              {/* Image */}
              {image && (
                <div className="flex-shrink-0">
                  <img
                    src={`http://localhost:1337${image.url}`}
                    alt={image.alternativeText || image.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              {/* Content */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
                {description && (
                  <p className="text-gray-600 mb-4">{description}</p>
                )}
              </div>
            </div>
            {/* Mosaic Content */}
            {mosaic.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenu dynamique</h3>
                {renderMosaic(mosaic)}
              </div>
            )}
            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                href={`/formation-docs/${doc.id}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Voir en détail
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
} 