export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nous Contacter
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une question sur nos formations ? Besoin d'accompagnement ? 
            Notre équipe est là pour vous aider dans votre parcours de formation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="information">Demande d'information</option>
                  <option value="inscription">Inscription à une formation</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat formateur</option>
                  <option value="enterprise">Formation en entreprise</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre demande en détail..."
                ></textarea>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  J'accepte que mes données personnelles soient utilisées pour traiter ma demande. 
                  <a href="/mentions" className="text-blue-600 hover:text-blue-700 underline ml-1">
                    Voir notre politique de confidentialité
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Envoyer le message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Coordonnées</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">info@helvetiforma.ch</p>
                    <p className="text-gray-600">support@helvetiforma.ch</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Localisation</h3>
                    <p className="text-gray-600">Suisse</p>
                    <p className="text-gray-600">Formation à distance et en présentiel</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horaires</h3>
                    <p className="text-gray-600">Lundi - Vendredi : 9h00 - 18h00</p>
                    <p className="text-gray-600">Support en ligne 24h/7j</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Questions fréquentes</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comment s'inscrire à une formation ?</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Consultez notre catalogue de formations et suivez le processus d'inscription en ligne.
                  </p>
                  <a href="/formations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir les formations →
                  </a>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Problème technique ?</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Consultez notre documentation ou contactez notre support technique.
                  </p>
                  <a href="/docs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir la documentation →
                  </a>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Devenir formateur ?</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Rejoignez notre équipe de formateurs experts et partagez votre savoir-faire.
                  </p>
                  <a href="/inscription-des-formateurs-et-formatrices" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Candidater →
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Support urgent ?</h3>
              <p className="text-orange-100 text-sm mb-4">
                Pour les problèmes techniques urgents pendant vos formations, 
                contactez directement notre équipe de support.
              </p>
              <a 
                href="mailto:support@helvetiforma.ch?subject=Support Urgent"
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors inline-block"
              >
                Contact urgent
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
