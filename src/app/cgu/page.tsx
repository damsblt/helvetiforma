'use client';

import React from 'react';
import Link from 'next/link';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-xl text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Acceptation des conditions</h2>
            <p className="text-gray-700 mb-6">
              En accédant et en utilisant la plateforme HelvetiForma, vous acceptez d'être lié par ces conditions générales d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Description du service</h2>
            <p className="text-gray-700 mb-6">
              HelvetiForma est une plateforme de formation professionnelle qui propose des cours en ligne et en présentiel. 
              Nos services incluent l'accès à du contenu éducatif, des modules de formation et un accompagnement personnalisé.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Inscription et compte utilisateur</h2>
            <p className="text-gray-700 mb-6">
              Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de maintenir 
              la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Utilisation acceptable</h2>
            <p className="text-gray-700 mb-6">
              Vous vous engagez à utiliser la plateforme uniquement à des fins légales et conformes à ces conditions. 
              Il est interdit d'utiliser le service pour transmettre du contenu illégal, offensant ou nuisible.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Propriété intellectuelle</h2>
            <p className="text-gray-700 mb-6">
              Tout le contenu de la plateforme, y compris les textes, images, vidéos et logiciels, est protégé par 
              les droits de propriété intellectuelle. Vous ne pouvez pas reproduire, distribuer ou modifier ce contenu sans autorisation.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Limitation de responsabilité</h2>
            <p className="text-gray-700 mb-6">
              HelvetiForma s'efforce de fournir des informations exactes et à jour, mais ne garantit pas l'exactitude, 
              l'exhaustivité ou l'adéquation du contenu. Nous ne sommes pas responsables des dommages indirects ou consécutifs.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. Modifications des conditions</h2>
            <p className="text-gray-700 mb-6">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet 
              immédiatement après leur publication sur la plateforme.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">8. Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant ces conditions, vous pouvez nous contacter à l'adresse suivante : 
              <a href="mailto:info@helvetiforma.ch" className="text-blue-600 hover:text-blue-700">info@helvetiforma.ch</a>
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
