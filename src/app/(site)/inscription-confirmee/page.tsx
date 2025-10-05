import { Metadata } from 'next'
import { CheckCircle, Mail, Clock, Users, ArrowRight, Star, Shield, Award } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Inscription Confirmée - HelvetiForma',
  description: 'Votre inscription a été confirmée avec succès. Bienvenue chez HelvetiForma !',
}

export default function InscriptionConfirmeePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-accent to-helvetiforma-purple" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Success Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* Main Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Inscription Confirmée !
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-8"
            >
              Bienvenue dans la communauté HelvetiForma
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-12"
          >
            {/* Congratulations Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Félicitations !
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Votre inscription a été enregistrée avec succès. Vous allez recevoir un email de confirmation 
                dans les prochaines minutes avec tous les détails de votre compte.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center">
                <Mail className="w-6 h-6 mr-3" />
                Prochaines étapes
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Vérifiez votre boîte email",
                    description: "Un email de confirmation vous a été envoyé avec tous les détails de votre compte",
                    icon: Mail,
                    color: "blue"
                  },
                  {
                    step: 2,
                    title: "Accédez à votre espace",
                    description: "Connectez-vous pour accéder à vos formations et ressources exclusives",
                    icon: Users,
                    color: "green"
                  },
                  {
                    step: 3,
                    title: "Explorez nos formations",
                    description: "Découvrez nos cours et webinaires disponibles",
                    icon: Star,
                    color: "purple"
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start"
                  >
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0`}>
                      <span className="text-sm font-bold text-${item.color}-600">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login"
                className="flex-1 btn btn-primary py-4 px-8 text-lg font-semibold flex items-center justify-center group"
              >
                <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Se connecter
              </Link>
              <Link 
                href="/formations"
                className="flex-1 btn btn-secondary py-4 px-8 text-lg font-semibold flex items-center justify-center group"
              >
                <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Voir les formations
              </Link>
            </div>
          </motion.div>

          {/* Additional Info Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Support Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Besoin d'aide ?
                </h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Si vous n'avez pas reçu l'email de confirmation, vérifiez vos spams ou contactez-nous directement.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
              >
                Nous contacter
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Sessions Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Prochaines sessions
                </h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Découvrez nos prochaines sessions de formation et webinaires. Inscrivez-vous dès maintenant !
              </p>
              <Link 
                href="/sessions"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
              >
                Voir le calendrier
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 text-center"
          >
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-500" />
                <span className="text-sm">Données sécurisées</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-500" />
                <span className="text-sm">Formations certifiées</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                <span className="text-sm">Expertise reconnue</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center mt-16"
          >
            <p className="text-gray-500 text-lg mb-2">
              Merci de nous faire confiance pour votre formation professionnelle.
            </p>
            <p className="text-gray-400 text-sm">
              L'équipe HelvetiForma
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
