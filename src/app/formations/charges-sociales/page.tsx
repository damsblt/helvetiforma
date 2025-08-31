import React from 'react';
import Link from 'next/link';
import CalendarLink from '@/components/CalendarLink';

export default function ChargesSocialesFormationPage() {
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
            <li className="text-gray-900 font-medium">Charges Sociales & Cotisations</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Charges Sociales & Cotisations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres 
            assurances sociales en entreprise. Formation avancée pour professionnels confirmés.
          </p>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>2 jours</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <span>Niveau Avancé</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              <span>CHF 980</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>Max 10 participants</span>
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
                Cette formation intensive de 2 jours vous permettra de maîtriser tous les aspects des charges sociales 
                et des cotisations en Suisse, de la théorie à la pratique.
              </p>
              <p className="text-gray-700">
                Vous apprendrez à calculer, déclarer et optimiser les charges sociales tout en respectant 
                la réglementation suisse et en maximisant les avantages pour votre entreprise.
              </p>
            </div>

            {/* Program */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Programme de la Formation</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-green-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 1 : Fondamentaux des Charges Sociales</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Cadre légal suisse des assurances sociales</li>
                    <li>• AVS, AI, APG : structure et fonctionnement</li>
                    <li>• LPP et prévoyance professionnelle</li>
                    <li>• Calcul des cotisations employeur et employé</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jour 2 : Gestion Avancée et Optimisation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Déclarations sociales et procédures</li>
                    <li>• Gestion des cas particuliers</li>
                    <li>• Optimisation fiscale et sociale</li>
                    <li>• Contrôles et audits sociaux</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Charges Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Détail des Charges Sociales</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">AVS - Assurance Vieillesse et Survivants</h3>
                  <p className="text-blue-800 text-sm">
                    Cotisation de base obligatoire pour tous les employés. Taux : 8.7% partagé entre employeur et employé.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">AI - Assurance Invalidité</h3>
                  <p className="text-green-800 text-sm">
                    Protection en cas d'invalidité. Taux : 1.4% partagé entre employeur et employé.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">APG - Allocations pour Perte de Gain</h3>
                  <p className="text-purple-800 text-sm">
                    Indemnités pendant le service militaire et la maternité. Taux : 0.5% à la charge de l'employeur.
                  </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">LPP - Prévoyance Professionnelle</h3>
                  <p className="text-orange-800 text-sm">
                    Deuxième pilier de la prévoyance. Taux variable selon l'âge et le salaire, partagé entre employeur et employé.
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
                  <span className="text-gray-700">Maîtriser la réglementation des assurances sociales</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Calculer précisément toutes les cotisations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Gérer les déclarations sociales</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Optimiser les charges sociales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Prêt à Commencer ?</h3>
                <p className="text-green-100 text-lg leading-relaxed">
                  Inscrivez-vous à cette formation et maîtrisez les charges sociales.
                </p>
              </div>
              
              <CalendarLink
                theme="Assurances sociales"
                className="group relative inline-flex items-center justify-center w-full bg-white text-green-600 py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-green-600 hover:text-white border-2 border-white hover:border-white"
              >
                <span className="flex items-center space-x-2">
                  <span>Voir les dates</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </CalendarLink>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Public Cible</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Comptables confirmés</li>
                <li>• Responsables RH seniors</li>
                <li>• Contrôleurs de gestion</li>
                <li>• Consultants en fiscalité</li>
                <li>• Chefs comptables</li>
              </ul>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prérequis</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Expérience en comptabilité (3+ ans)</li>
                <li>• Connaissances de base en fiscalité</li>
                <li>• Maîtrise du français</li>
                <li>• Compréhension des processus RH</li>
              </ul>
            </div>

            {/* Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inclus dans la Formation</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Support de cours complet</li>
                <li>• Calculateurs et outils pratiques</li>
                <li>• Certificat de participation</li>
                <li>• Accès aux ressources en ligne</li>
                <li>• Support post-formation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à Maîtriser les Charges Sociales ?
            </h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Rejoignez notre formation avancée et développez une expertise reconnue dans la gestion 
              des charges sociales et des cotisations en Suisse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendarLink
                theme="Assurances sociales"
                className="bg-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <span className="text-green-600 hover:text-white">Voir les dates</span>
              </CalendarLink>
              <Link
                href="/formations"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
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
