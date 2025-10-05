import { Metadata } from 'next'
import { CheckCircle, Mail, Clock, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inscription Confirmée - HelvetiForma',
  description: 'Votre inscription a été confirmée avec succès. Bienvenue chez HelvetiForma !',
}

export default function InscriptionConfirmeePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Inscription Confirmée !
            </h1>
            <p className="text-xl text-gray-600">
              Bienvenue dans la communauté HelvetiForma
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                🎉 Félicitations !
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Votre inscription a été enregistrée avec succès. Vous allez recevoir un email de confirmation 
                dans les prochaines minutes avec tous les détails de votre compte.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Prochaines étapes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Vérifiez votre boîte email</p>
                    <p className="text-sm text-blue-700">Un email de confirmation vous a été envoyé</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Accédez à votre espace</p>
                    <p className="text-sm text-blue-700">Connectez-vous pour accéder à vos formations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Explorez nos formations</p>
                    <p className="text-sm text-blue-700">Découvrez nos cours et webinaires disponibles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Se connecter
              </Link>
              <Link 
                href="/formations"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Voir les formations
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Support Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Besoin d'aide ?
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Si vous n'avez pas reçu l'email de confirmation, vérifiez vos spams ou contactez-nous.
              </p>
              <Link 
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Nous contacter →
              </Link>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Prochaines sessions
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Découvrez nos prochaines sessions de formation et webinaires.
              </p>
              <Link 
                href="/sessions"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir le calendrier →
              </Link>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Merci de nous faire confiance pour votre formation professionnelle.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              L'équipe HelvetiForma
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
