'use client';

import React from 'react';
import Link from 'next/link';

export default function MentionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions Légales</h1>
          <p className="text-xl text-gray-600">
            Informations légales et réglementaires
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Éditeur du site</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-2"><strong>Raison sociale :</strong> Helvetiforma</p>
              <p className="text-gray-700 mb-2"><strong>Adresse :</strong> Suisse</p>
              <p className="text-gray-700 mb-2"><strong>Email :</strong> contact@helvetiforma.ch</p>
              <p className="text-gray-700 mb-2"><strong>Site web :</strong> https://www.helvetiforma.ch</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Hébergement</h2>
            <p className="text-gray-700 mb-6">
              Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Propriété intellectuelle</h2>
            <p className="text-gray-700 mb-6">
              L'ensemble de ce site relève de la législation suisse et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations 
              iconographiques et photographiques.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Protection des données personnelles</h2>
            <p className="text-gray-700 mb-6">
              Conformément à la loi fédérale sur la protection des données (LPD), vous disposez d'un droit d'accès, de rectification 
              et de suppression des données vous concernant. Pour exercer ces droits, contactez-nous à contact@helvetiforma.ch.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Cookies</h2>
            <p className="text-gray-700 mb-6">
              Ce site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer votre navigateur 
              pour refuser les cookies, mais cela peut affecter le fonctionnement du site.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Liens hypertextes</h2>
            <p className="text-gray-700 mb-6">
              Les liens hypertextes mis en place dans le cadre du présent site web en direction d'autres ressources présentes 
              sur le réseau Internet ne sauraient engager la responsabilité de Helvetiforma.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. Droit applicable</h2>
            <p className="text-gray-700 mb-6">
              Tout litige en relation avec l'utilisation du site helvetiforma.ch est soumis au droit suisse. 
              En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents de Suisse.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">8. Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse suivante : 
              <a href="mailto:contact@helvetiforma.ch" className="text-blue-600 hover:text-blue-700">contact@helvetiforma.ch</a>
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
