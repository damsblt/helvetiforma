import React from 'react';
import Link from 'next/link';
import FormationDocViewer from './FormationDocViewer';

interface FormationDoc {
  id: number;
  attributes: {
    title: string;
    description: string;
    image: any;
    mosaic: any[];
  };
}

async function getFormationDoc(id: string): Promise<FormationDoc | null> {
  try {
    const res = await fetch(`http://localhost:1337/api/formation-docs/${id}?populate=*`, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('Failed to fetch formation doc:', res.status);
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching formation doc:', error);
    return null;
  }
}

export default async function FormationDocPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params instead of using React.use()
  const resolvedParams = await params;
  const formationDoc = await getFormationDoc(resolvedParams.id);

  if (!formationDoc) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Document non trouvé</h1>
            <p className="text-gray-600 mb-6">Le document que vous recherchez n'existe pas ou a été supprimé.</p>
            <Link href="/formation-docs" className="text-blue-600 hover:text-blue-800">
              ← Retour aux documents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/formation-docs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Retour aux documents
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formationDoc.attributes.title}</h1>
          <p className="text-gray-600">{formationDoc.attributes.description}</p>
        </div>

        {/* Document Viewer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormationDocViewer
            title={formationDoc.attributes.title}
            description={formationDoc.attributes.description}
            image={formationDoc.attributes.image}
            dynamicZone={formationDoc.attributes.mosaic}
          />
        </div>
      </div>
    </div>
  );
} 