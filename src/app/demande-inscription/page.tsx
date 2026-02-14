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
      const parsedData = JSON.parse(storedData)
      console.log('Registration data from localStorage:', parsedData)
      console.log('Price from localStorage:', parsedData.price)
      setRegistrationData(parsedData)
    } else if (urlParams.get('webinar')) {
      // Données depuis l'URL
      const urlData = {
        webinar: urlParams.get('webinar'),
        date: urlParams.get('webinarDateTime'),
        location: urlParams.get('webinarLocation'),
        price: urlParams.get('webinarPrice')
      }
      console.log('Registration data from URL:', urlData)
      console.log('Price from URL:', urlData.price)
      setRegistrationData(urlData)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Demande d'inscription transmise !
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Votre demande d'inscription a été transmise avec succès. Vous recevrez un email de confirmation avec tous les détails.
            </p>
          </div>

          {/* Détails de l'inscription */}
          {registrationData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Détails de votre formation
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Formation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Formation</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{registrationData.webinar || 'Formation HelvetiForma'}</p>
                </div>

                {/* Date et heure */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                      <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date et heure</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {registrationData.date ? 
                      (() => {
                        try {
                          const date = new Date(registrationData.date)
                          if (isNaN(date.getTime())) {
                            return registrationData.date // Afficher la valeur brute si ce n'est pas une date valide
                          }
                          return date.toLocaleString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        } catch (error) {
                          return registrationData.date // Afficher la valeur brute en cas d'erreur
                        }
                      })() : 
                      'À confirmer par email'
                    }
                  </p>
                </div>

                {/* Lieu */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                      <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lieu</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{registrationData.location || 'En ligne'}</p>
                </div>

                {/* Prix */}
                {registrationData.price && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mr-4">
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">CHF</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prix</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold">{registrationData.price}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}



          {/* Actions de navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Retour à l'accueil
              </Link>
              
              <Link
                href="/sessions"
                className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200"
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
