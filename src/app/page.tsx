import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Full-Screen Background Image */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Formation professionnelle en Suisse"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Bienvenue sur <span className="text-blue-400">Helvetiforma</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Votre plateforme de formation professionnelle en Suisse. 
            Découvrez nos formations spécialisées et développez vos compétences 
            avec une approche moderne et flexible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/formations"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
            >
              Découvrir nos formations
            </Link>
            <Link
              href="/concept"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 font-medium text-lg border-2 border-white shadow-lg"
            >
              Notre approche
            </Link>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features Section with Illustration Images */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Pourquoi choisir Helvetiforma ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/images/certification-icon.png"
                  alt="Formations certifiantes"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Formations Certifiantes</h3>
              <p className="text-gray-600">
                Nos programmes délivrent des certificats reconnus qui attestent 
                de vos compétences acquises et valorisent votre CV.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/images/flexibility-icon.png"
                  alt="Apprentissage flexible"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Apprentissage Flexible</h3>
              <p className="text-gray-600">
                Combinez cours en ligne et sessions en présentiel selon vos disponibilités. 
                Apprenez à votre rythme, où et quand vous voulez.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/images/support-icon.png"
                  alt="Support personnalisé"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Personnalisé</h3>
              <p className="text-gray-600">
                Bénéficiez d'un accompagnement sur mesure avec nos formateurs experts 
                et notre équipe dédiée à votre réussite.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section with Split Layout and Image */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Une approche moderne de la formation
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Helvetiforma révolutionne l'apprentissage professionnel en combinant 
                la flexibilité du digital avec l'efficacité de l'enseignement traditionnel.
              </p>
              <p className="text-gray-600 mb-8">
                Notre plateforme vous offre un accès à des ressources de qualité, 
                des modules interactifs et un suivi personnalisé pour maximiser 
                vos chances de réussite.
              </p>
              <Link
                href="/concept"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg"
              >
                En savoir plus sur notre approche
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/learning-approach.jpg"
                  alt="Approche d'apprentissage moderne"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating stats cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Apprenants satisfaits</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-blue-600 rounded-lg p-4 shadow-lg text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm">Taux de réussite</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section with Background Image */}
      <div className="py-20 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/stats-bg.jpg"
            alt="Statistiques Helvetiforma"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-80"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Nos chiffres parlent d'eux-mêmes</h2>
            <p className="text-xl text-blue-100">Une croissance constante et des résultats probants</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Apprenants formés</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Formations disponibles</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Taux de satisfaction</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Support disponible</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Gradient Background */}
      <div className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à développer vos compétences ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de professionnels qui ont déjà choisi 
            Helvetiforma pour leur formation continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
            >
              Consulter nos ressources
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
