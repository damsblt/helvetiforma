'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ConceptPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/concept-hero.jpg"
            alt="Notre concept de formation"
            fill
            className="object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Notre Concept</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Découvrez notre approche innovante de la formation professionnelle 
            qui combine le meilleur de l'apprentissage en ligne et en présentiel.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Blended Learning Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 mb-16">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">Apprentissage hybride (Blended Learning)</h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 font-medium">
                  Notre approche révolutionne la formation en combinant deux modalités d'apprentissage :
                </p>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Image
                        src="/images/online-learning-icon.png"
                        alt="Formation en ligne"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Formation à distance</h3>
                      <p className="text-gray-600">Modules en ligne flexibles et accessibles 24h/24</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Image
                        src="/images/onsite-learning-icon.png"
                        alt="Formation en présentiel"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Sessions en présentiel</h3>
                      <p className="text-gray-600">Validation des acquis et pratique avec nos formateurs experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center shadow-lg">
                <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Image
                    src="/images/blended-learning-icon.png"
                    alt="Formation hybride"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Formation hybride</h3>
                <p className="text-gray-600">Le meilleur des deux mondes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Section with Image */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">Notre philosophie</h2>
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Apprendre avec plaisir</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nous croyons que l'apprentissage est plus efficace quand il est agréable et engageant. 
                    Nos formations sont conçues pour stimuler votre curiosité et maintenir votre motivation.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Approche personnalisée</h4>
                    <p className="text-gray-600">
                      Notre approche combine le meilleur de l'apprentissage en ligne et en présentiel 
                      pour créer une expérience d'apprentissage optimale et engageante.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Validation des compétences</h4>
                    <p className="text-gray-600">
                      Nous croyons que l'apprentissage efficace passe par une combinaison de flexibilité 
                      numérique et de validation humaine des compétences acquises.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/philosophy-image.jpg"
                  alt="Philosophie d'apprentissage"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section with Icons */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">Avantages de notre approche</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/flexibility-icon.png"
                    alt="Flexibilité"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexibilité maximale</h3>
                  <p className="text-gray-600">Apprenez à votre rythme, où et quand vous voulez</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/support-icon.png"
                    alt="Support"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Suivi personnalisé</h3>
                  <p className="text-gray-600">Accompagnement sur mesure avec nos formateurs experts</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/quality-icon.png"
                    alt="Qualité"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ressources de qualité</h3>
                  <p className="text-gray-600">Contenu pédagogique créé par des experts du domaine</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/certification-icon.png"
                    alt="Certification"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Certification reconnue</h3>
                  <p className="text-gray-600">Diplômes et certificats valorisés par les employeurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action with Background Image */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/concept-cta-bg.jpg"
              alt="Prêt à commencer"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 bg-opacity-80"></div>
          </div>
          
          <div className="relative z-10 p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-6">Prêt à commencer votre formation ?</h3>
            <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg">
              Découvrez nos formations spécialisées et commencez votre parcours d'apprentissage 
              dès aujourd'hui avec notre approche hybride innovante.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/formations" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all transform hover:scale-105 text-lg shadow-lg"
              >
                Consulter les formations
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 text-lg shadow-lg"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 