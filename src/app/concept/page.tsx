import React from 'react';
import Link from 'next/link';

export default function ConceptPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Main Content */}
      <main className="container mx-auto px-4">
        {/* Top Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Block - Blended Learning */}
          <div className="lg:col-span-2 bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-4">Online learning (description)</h2>
            <div className="space-y-3 text-black">
              <p className="text-lg font-semibold">= blended learning</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  - cours à distance
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  - cours en présentiel (où on valide les acquis après un module)
                </li>
              </ul>
            </div>
          </div>

          {/* Right Block - Image */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm overflow-hidden">
            <img 
              src="/profile-picture.png" 
              alt="Woman with dark hair and sunglasses in a car"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Middle Section - Philosophy */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-8 mb-8 shadow-sm">
          <h2 className="text-3xl font-bold text-black mb-4">Ma philosophie</h2>
          <p className="text-xl text-black leading-relaxed">
            Apprendre avec plaisir, etc.....
          </p>
          <div className="mt-6 space-y-3">
            <p className="text-black">
              Notre approche combine le meilleur de l'apprentissage en ligne et en présentiel pour créer 
              une expérience d'apprentissage optimale et engageante.
            </p>
            <p className="text-black">
              Nous croyons que l'apprentissage efficace passe par une combinaison de flexibilité numérique 
              et de validation humaine des compétences acquises.
            </p>
          </div>
        </div>

        {/* Bottom Section - Call to Action */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-black mb-4">Prêt à commencer votre formation ?</h3>
          <p className="text-black mb-6">
            Découvrez nos formations spécialisées et commencez votre parcours d'apprentissage dès aujourd'hui.
          </p>
          <Link 
            href="/formations" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
          >
            Consulter les formations
          </Link>
        </div>
      </main>
    </div>
  );
} 