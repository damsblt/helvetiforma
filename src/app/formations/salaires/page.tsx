import React from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';

export default function SalairesFormationPage() {
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
            <li className="text-gray-900 font-medium">Gestion des Salaires</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">💰</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Gestion des Salaires
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. 
            Formation pratique avec cas concrets et outils modernes.
          </p>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>3 jours</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <span>Niveau Intermédiaire</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              <span>CHF 1,200</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>Max 12 participants</span>
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
                Cette formation intensive de 3 jours vous permettra de maîtriser tous les aspects de la gestion des salaires 
                en Suisse, de la conformité légale aux outils pratiques de gestion RH.
              </p>
              <p className="text-gray-700">
                Vous apprendrez à gérer efficacement les salaires, les avantages sociaux, les congés et les absences, 
                tout en respectant la réglementation suisse et en optimisant les processus de votre entreprise.
              </p>
            </div>

            {/* Program */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Programme de la Formation</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 1 : Fondamentaux de la Gestion des Salaires</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Cadre légal suisse et obligations de l'employeur</li>
                    <li>• Structure des salaires et composantes</li>
                    <li>• Calcul des salaires de base et variables</li>
                    <li>• Gestion des heures supplémentaires et du travail de nuit</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 2 : Avantages Sociaux et Gestion RH</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Gestion des congés et absences</li>
                    <li>• Calcul des indemnités et avantages</li>
                    <li>• Gestion des primes et bonus</li>
                    <li>• Outils de gestion RH et logiciels</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 3 : Conformité et Optimisation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Déclarations sociales et fiscales</li>
                    <li>• Contrôles et audits</li>
                    <li>• Bonnes pratiques et optimisation</li>
                    <li>• Cas pratiques et mise en situation</li>
                  </ul>
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
                  <span className="text-gray-700">Maîtriser la réglementation suisse des salaires</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Gérer efficacement les avantages sociaux</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Optimiser les processus de gestion RH</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Assurer la conformité légale</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-4">Prêt à Commencer ?</h3>
              <p className="text-blue-100 mb-6">
                Inscrivez-vous à cette formation et développez vos compétences en gestion des salaires.
              </p>
              <CalendarLink
                theme="Salaire"
                className="block w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir les dates
              </CalendarLink>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Public Cible</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Responsables RH</li>
                <li>• Comptables et contrôleurs</li>
                <li>• Gestionnaires de paie</li>
                <li>• Chefs d'entreprise</li>
                <li>• Consultants en ressources humaines</li>
              </ul>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prérequis</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Connaissances de base en comptabilité</li>
                <li>• Expérience en gestion d'entreprise</li>
                <li>• Maîtrise du français</li>
                <li>• Ordinateur portable (recommandé)</li>
              </ul>
            </div>

            {/* Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inclus dans la Formation</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Support de cours complet</li>
                <li>• Cas pratiques et exercices</li>
                <li>• Certificat de participation</li>
                <li>• Accès aux ressources en ligne</li>
                <li>• Support post-formation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à Maîtriser la Gestion des Salaires ?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Rejoignez notre formation et développez des compétences essentielles pour votre carrière 
              et votre entreprise. Contactez-nous pour plus d'informations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendarLink
                theme="Salaire"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir les dates
              </CalendarLink>
              <Link
                href="/formations"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
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
