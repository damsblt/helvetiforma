import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Bienvenue sur Helvetiforma
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre plateforme de formation en ligne
          </p>
          <div className="space-x-4">
            <Link
              href="/formations"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Voir les Formations
            </Link>
            <Link
              href="/api-control"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Contrôle API
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
