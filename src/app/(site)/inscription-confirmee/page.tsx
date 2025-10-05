'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, Calendar, Mail, Phone, ArrowRight, Download, Users, Clock } from 'lucide-react'

export default function InscriptionConfirmeePage() {
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer les données d'inscription depuis l'URL ou le localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const storedData = localStorage.getItem('registrationData')
    
    if (storedData) {
      setRegistrationData(JSON.parse(storedData))
    } else if (urlParams.get('webinar')) {
      // Données depuis l'URL
      setRegistrationData({
        webinar: urlParams.get('webinar'),
        date: urlParams.get('webinarDateTime'),
        location: urlParams.get('webinarLocation'),
        price: urlParams.get('webinarPrice')
      })
    }
    
    setLoading(false)
  }, [])

  const handleDownloadCalendar = () => {
    // Générer un fichier .ics pour l'événement
    const startDate = new Date(registrationData?.date || new Date())
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // +2 heures
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HelvetiForma//Formation//FR
BEGIN:VEVENT
UID:${Date.now()}@helvetiforma.ch
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${registrationData?.webinar || 'Formation HelvetiForma'}
DESCRIPTION:Formation professionnelle HelvetiForma
LOCATION:${registrationData?.location || 'En ligne'}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'formation-helvetiforma.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header de confirmation */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Inscription Confirmée !
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Votre inscription a été enregistrée avec succès. Vous recevrez un email de confirmation avec tous les détails.
            </p>
          </div>

          {/* Détails de l'inscription */}
          {registrationData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                Détails de votre formation
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Formation</h3>
                      <p className="text-gray-600">{registrationData.webinar || 'Formation HelvetiForma'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-lg mr-4">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Date et heure</h3>
                      <p className="text-gray-600">
                        {registrationData.date ? 
                          new Date(registrationData.date).toLocaleString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'À confirmer par email'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Lieu</h3>
                      <p className="text-gray-600">{registrationData.location || 'En ligne'}</p>
                    </div>
                  </div>
                  
                  {registrationData.price && (
                    <div className="flex items-start">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-4">
                        <span className="text-yellow-600 font-bold">CHF</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Prix</h3>
                        <p className="text-gray-600">{registrationData.price}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Ajouter au calendrier */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="w-5 h-5 text-blue-600 mr-2" />
                Ajouter au calendrier
              </h3>
              <p className="text-gray-600 mb-4">
                Téléchargez l'événement pour l'ajouter à votre calendrier personnel.
              </p>
              <button
                onClick={handleDownloadCalendar}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger (.ics)
              </button>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 mb-4">
                Notre équipe est là pour vous accompagner dans votre formation.
              </p>
              <Link
                href="/contact"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Nous contacter
              </Link>
            </div>
          </motion.div>

          {/* Prochaines étapes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-6">Prochaines étapes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email de confirmation</h3>
                  <p className="text-blue-100 text-sm">
                    Vous recevrez un email avec tous les détails de votre formation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Rappel avant l'événement</h3>
                  <p className="text-blue-100 text-sm">
                    Nous vous enverrons un rappel 24h avant votre formation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Accès à la formation</h3>
                  <p className="text-blue-100 text-sm">
                    Le lien de connexion vous sera envoyé par email.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions de navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Retour à l'accueil
              </Link>
              
              <Link
                href="/sessions"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200"
              >
                Voir toutes les sessions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
