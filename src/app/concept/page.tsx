import Link from 'next/link';

export default function ConceptPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Notre Concept
          </h1>
          <p className="text-xl text-gray-600">
            Une approche innovante de la formation professionnelle
          </p>
        </div>

        {/* Blended Learning Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Formation Hybride (Blended Learning)
              </h2>
              
              <p className="text-lg text-gray-700 font-medium mb-4">
                Notre approche combine le meilleur de l'apprentissage en ligne et en présentiel 
                pour une expérience d'apprentissage optimale et personnalisée.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Formation à distance</h3>
                    <p className="text-gray-600">Modules en ligne flexibles et accessibles 24h/24</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sessions en présentiel</h3>
                    <p className="text-gray-600">Validation des acquis et pratique avec nos formateurs experts</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Formation hybride</h3>
              <p className="text-sm text-gray-600">Le meilleur des deux mondes</p>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notre philosophie</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Apprendre avec plaisir</h3>
              <p className="text-gray-700 leading-relaxed">
                Nous croyons que l'apprentissage doit être engageant et motivant. Notre approche 
                pédagogique privilégie l'interaction, la pratique et l'application concrète des 
                connaissances dans un environnement bienveillant et stimulant.
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

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Avantages de notre approche</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Flexibilité maximale</h3>
                  <p className="text-gray-600">Apprenez à votre rythme, où et quand vous voulez</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Suivi personnalisé</h3>
                  <p className="text-gray-600">Accompagnement sur mesure avec nos formateurs experts</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ressources de qualité</h3>
                  <p className="text-gray-600">Contenu pédagogique créé par des experts du domaine</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Certification reconnue</h3>
                  <p className="text-gray-600">Diplômes et certificats valorisés par les employeurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Fonctionnalités de notre concept
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Plateforme d\'apprentissage intuitive',
              'Suivi en temps réel de la progression',
              'Ressources pédagogiques interactives',
              'Sessions de validation en présentiel',
              'Support technique et pédagogique',
              'Communauté d\'apprenants active',
              'Évaluations personnalisées',
              'Certificats reconnus par l\'industrie'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Prêt à commencer votre formation ?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Découvrez nos formations spécialisées et commencez votre parcours d'apprentissage 
            dès aujourd'hui avec notre approche hybride innovante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/formations" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-lg"
            >
              Consulter les formations
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
