import Link from 'next/link';

export default function DocsPage() {
  const documentationSections = [
    {
      title: "Guide de l'apprenant",
      description: "Tout ce que vous devez savoir pour réussir votre formation",
      items: [
        "Comment s'inscrire à une formation",
        "Naviguer sur la plateforme",
        "Suivre votre progression",
        "Accéder aux ressources",
        "Passer les évaluations",
        "Obtenir votre certificat"
      ],
      color: "blue"
    },
    {
      title: "Guide du formateur",
      description: "Ressources pour nos formateurs partenaires",
      items: [
        "Créer et gérer vos cours",
        "Outils pédagogiques disponibles",
        "Suivi des apprenants",
        "Évaluation et notation",
        "Ressources techniques",
        "Support et assistance"
      ],
      color: "green"
    },
    {
      title: "Spécificités Suisses",
      description: "Documentation sur le contexte légal et fiscal suisse",
      items: [
        "Droit comptable suisse (CO/LSC)",
        "Charges sociales et AVS",
        "Fiscalité des entreprises",
        "Impôt à la source",
        "TVA et décomptes",
        "Conventions collectives"
      ],
      color: "purple"
    },
    {
      title: "Support Technique",
      description: "Aide technique et résolution de problèmes",
      items: [
        "Configuration requise",
        "Problèmes de connexion",
        "Navigateurs supportés",
        "Téléchargement des certificats",
        "Sauvegarde des données",
        "Contacter le support"
      ],
      color: "orange"
    }
  ];

  const faqs = [
    {
      question: "Comment accéder à mes formations ?",
      answer: "Une fois inscrit et connecté, rendez-vous dans votre tableau de bord pour accéder à toutes vos formations actives et votre progression."
    },
    {
      question: "Puis-je suivre les formations à mon rythme ?",
      answer: "Oui, nos formations en ligne sont conçues pour être suivies à votre rythme. Seules les sessions de validation en présentiel ont des dates fixes."
    },
    {
      question: "Les certificats sont-ils reconnus ?",
      answer: "Nos certificats sont reconnus par les entreprises suisses et respectent les standards de formation professionnelle continue."
    },
    {
      question: "Que faire si j'ai des difficultés techniques ?",
      answer: "Notre équipe de support technique est disponible pour vous aider. Contactez-nous via le formulaire de contact ou directement depuis votre tableau de bord."
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200",
      green: "from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200",
      purple: "from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200",
      orange: "from-orange-500 to-orange-600 bg-orange-50 text-orange-700 border-orange-200"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez toutes les informations nécessaires pour utiliser efficacement 
            notre plateforme de formation et réussir votre parcours d'apprentissage
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Accès rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/tutor-login" 
              className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Connexion
            </Link>
            <Link 
              href="/tableau-de-bord" 
              className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Tableau de bord
            </Link>
            <Link 
              href="/formations" 
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Formations
            </Link>
            <Link 
              href="/contact" 
              className="flex items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {documentationSections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getColorClasses(section.color).split(' ')[0]} ${getColorClasses(section.color).split(' ')[1]}`}></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Questions Fréquemment Posées
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Requirements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration Technique Recommandée</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigateurs supportés</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Google Chrome (version 90+)</li>
                <li>• Mozilla Firefox (version 88+)</li>
                <li>• Safari (version 14+)</li>
                <li>• Microsoft Edge (version 90+)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connexion internet</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Connexion haut débit recommandée</li>
                <li>• Minimum 5 Mbps pour les vidéos</li>
                <li>• Connexion stable pour les sessions en direct</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Besoin d'aide supplémentaire ?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Notre équipe de support est là pour vous accompagner dans votre parcours de formation. 
            N'hésitez pas à nous contacter pour toute question.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Contacter le support
            </Link>
            <a 
              href="mailto:support@helvetiforma.ch" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              support@helvetiforma.ch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
