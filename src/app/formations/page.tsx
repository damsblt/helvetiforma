'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';

export default function FormationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Nos Formations
          </h1>
          <p className="text-gray-600">
            Découvrez nos formations spécialisées
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Formations en cours de chargement</h2>
          <p className="text-gray-600 mb-6">Les formations seront bientôt disponibles.</p>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 