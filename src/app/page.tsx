import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Full Screen Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
        {/* Content Overlay */}
        <div className="relative z-10 min-h-screen flex items-center pt-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-blue-900 leading-tight">
                Blended learning.
                <br />
                <span className="text-blue-700">Compétences hybrides.</span>
                <br />
                <span className="text-blue-600">Succès en formation.</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-800 leading-relaxed">
                Formations et documents pour réussir votre collège de Suisse romande.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/formations" 
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Découvrir nos formations
                </Link>
                <Link 
                  href="/concept" 
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg border-2 border-blue-600"
                >
                  Notre concept
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Rest of the content */}
      <section className="container mx-auto py-10 px-4 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 bg-white rounded shadow p-6 text-center">
          <h2 className="text-xl font-bold mb-2">À propos de nous</h2>
          <p className="mb-4 text-gray-700">[Texte à propos de la plateforme, de son équipe, de sa mission...]</p>
          <Link href="/concept" className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
            En savoir plus
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-40 h-40 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">Visuel / Logo</div>
        </div>
      </section>

      <section className="container mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Nos trois formations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-yellow-50 rounded shadow p-6 text-center">
            <div className="font-semibold text-yellow-700 mb-2">💰 Salaire</div>
            <div className="text-gray-600 mb-4">Formations sur la gestion des salaires et la paie</div>
            <Link href="/formations?theme=salaire" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">
              En savoir plus
            </Link>
          </div>
          <div className="bg-blue-50 rounded shadow p-6 text-center">
            <div className="font-semibold text-blue-700 mb-2">🛡️ Assurances sociales</div>
            <div className="text-gray-600 mb-4">Formations sur les assurances sociales et la sécurité sociale</div>
            <Link href="/formations?theme=assurances-sociales" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              En savoir plus
            </Link>
          </div>
          <div className="bg-green-50 rounded shadow p-6 text-center">
            <div className="font-semibold text-green-700 mb-2">📊 Impôt à la source</div>
            <div className="text-gray-600 mb-4">Formations sur l'impôt à la source et la fiscalité</div>
            <Link href="/formations?theme=impot-a-la-source" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-10 px-4">
        <div className="container mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 bg-white rounded shadow p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Le coin des Docs</h2>
            <p className="mb-4 text-gray-700">Vidéos, résumés, infographies, fiches pratiques…</p>
            <Link href="/docs" className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
              Explorer les documents
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-40 h-40 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">Visuel Docs</div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-10 px-4 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 bg-white rounded shadow p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Interaction IA</h2>
          <p className="mb-4 text-gray-700">Posez vos questions à notre chatbot intelligent, accédez à des explications personnalisées et à des ressources adaptées à votre profil.</p>
          <Link href="/ia" className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
            Découvrir l'IA
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-40 h-40 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">Visuel IA</div>
        </div>
      </section>

      <section className="container mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Ils nous font confiance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-6">Témoignage 1 (placeholder)</div>
          <div className="bg-white rounded shadow p-6">Témoignage 2 (placeholder)</div>
        </div>
      </section>
    </>
  );
}
// Force new deployment Tue Aug 26 08:56:13 CEST 2025
// Helvetiforma Custom App - Tue Aug 26 09:02:06 CEST 2025
