import React from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';

export default function ImpotALaSourceFormationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-blue-600">Accueil</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/formations" className="hover:text-blue-600">Formations</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium">Impôt à la Source</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Impôt à la Source
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Formation spécialisée sur l'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. 
            Procédures, calculs et bonnes pratiques pour une gestion fiscale optimale.
          </p>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>1.5 jours</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <span>Niveau Spécialisé</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              <span>CHF 750</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>Max 8 participants</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Aperçu de la Formation</h2>
              <p className="text-gray-700 mb-4">
                Cette formation intensive de 1.5 jours vous permettra de maîtriser tous les aspects de l'impôt à la source 
                en Suisse, particulièrement important pour les travailleurs frontaliers et les employés étrangers.
              </p>
              <p className="text-gray-700">
                Vous apprendrez à calculer, déclarer et optimiser l'impôt à la source tout en respectant 
                la réglementation suisse et en maximisant les avantages pour votre entreprise et vos employés.
              </p>
            </div>

            {/* Program */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Programme de la Formation</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 1 : Fondamentaux de l'Impôt à la Source</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Cadre légal suisse de l'impôt à la source</li>
                    <li>• Définition et champ d'application</li>
                    <li>• Catégories de travailleurs concernés</li>
                    <li>• Obligations de l'employeur</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 2 : Calcul et Gestion (Matin)</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Calcul de l'impôt à la source</li>
                    <li>• Déclarations et procédures</li>
                    <li>• Cas particuliers et exceptions</li>
                    <li>• Bonnes pratiques et optimisation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Concepts Clés de l'Impôt à la Source</h2>
              
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Qu'est-ce que l'Impôt à la Source ?</h3>
                  <p className="text-purple-800 text-sm">
                    L'impôt à la source est un prélèvement fiscal automatique effectué par l'employeur sur le salaire 
                    des travailleurs étrangers et frontaliers, avant le versement du salaire net.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Travailleurs Concernés</h3>
                  <p className="text-blue-800 text-sm">
                    • Travailleurs frontaliers (France, Allemagne, Italie, Autriche)<br/>
                    • Employés étrangers sans permis C<br/>
                    • Stagiaires et apprentis étrangers<br/>
                    • Consultants internationaux
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Obligations de l'Employeur</h3>
                  <p className="text-green-800 text-sm">
                    • Calculer et prélever l'impôt à la source<br/>
                    • Déclarer les salaires et impôts prélevés<br/>
                    • Verser l'impôt aux autorités fiscales<br/>
                    • Tenir une comptabilité détaillée
                  </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Avantages de l'Impôt à la Source</h3>
                  <p className="text-orange-800 text-sm">
                    • Simplification pour le travailleur<br/>
                    • Pas de déclaration fiscale annuelle<br/>
                    • Gestion centralisée par l'employeur<br/>
                    • Respect automatique des obligations fiscales
                  </p>
                </div>
              </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Objectifs d'Apprentissage</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Comprendre la réglementation suisse</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Calculer précisément l'impôt à la source</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Gérer les déclarations fiscales</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Optimiser la gestion fiscale</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="bg-purple-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-4">Prêt à Commencer ?</h3>
              <p className="text-purple-100 mb-6">
                Inscrivez-vous à cette formation spécialisée et maîtrisez l'impôt à la source.
              </p>
              <CalendarLink
                theme="Impôt à la source"
                className="block w-full bg-white text-purple-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir les dates
              </CalendarLink>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Public Cible</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Responsables RH internationaux</li>
                <li>• Comptables spécialisés fiscalité</li>
                <li>• Consultants en mobilité internationale</li>
                <li>• Avocats fiscalistes</li>
                <li>• Chefs d'entreprise frontaliers</li>
              </ul>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prérequis</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Connaissances en fiscalité (2+ ans)</li>
                <li>• Expérience en gestion RH</li>
                <li>• Maîtrise du français</li>
                <li>• Compréhension des relations internationales</li>
              </ul>
            </div>

            {/* Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inclus dans la Formation</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Support de cours complet</li>
                <li>• Calculateurs d'impôt à la source</li>
                <li>• Certificat de participation</li>
                <li>• Accès aux ressources en ligne</li>
                <li>• Support post-formation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à Maîtriser l'Impôt à la Source ?
            </h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Rejoignez notre formation spécialisée et développez une expertise unique dans la gestion 
              de l'impôt à la source pour les travailleurs internationaux en Suisse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendarLink
                theme="Impôt à la source"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir les dates
              </CalendarLink>
              <Link
                href="/formations"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Voir toutes les formations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
