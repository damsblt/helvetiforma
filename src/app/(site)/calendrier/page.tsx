'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TeamsWebinar } from '@/types/microsoft'

export default function CalendrierPage() {
  const [webinars, setWebinars] = useState<TeamsWebinar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>('unknown')

  useEffect(() => {
    fetchWebinars()
  }, [])

  const fetchWebinars = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/webinars')
      const data = await response.json()
      
      if (data.success) {
        setWebinars(data.data)
        setDataSource(data.source || 'unknown')
        console.log(`Loaded ${data.count} webinars from ${data.source}`)
      } else {
        setError(data.error || 'Failed to load webinars')
      }
    } catch (err) {
      setError('An error occurred while loading webinars')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (webinarId: string, webinarTitle: string) => {
    try {
      setRegistering(webinarId)
      
      // Store webinar info for after guest registration
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('pendingWebinar', JSON.stringify({
          id: webinarId,
          title: webinarTitle,
          timestamp: Date.now()
        }))
      }
      
      // Redirect to Microsoft guest invitation
      const tenantId = '0c41c554-0d55-4550-8412-ba89c98481f0'
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const redirectUrl = encodeURIComponent(`https://myaccount.microsoft.com/?tenantId=${tenantId}`)
      
      // Microsoft self-service guest signup URL
      const signupUrl = `https://signup.microsoft.com/get-started/signup?sku=guest&ru=${redirectUrl}`
      
      // Redirect user to Microsoft guest invitation
      if (typeof window !== 'undefined') {
        window.location.href = signupUrl
      }
      
    } catch (err) {
      alert('Une erreur est survenue lors de la redirection')
      console.error(err)
      setRegistering(null)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat('fr-CH', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(d)
  }

  const formatDuration = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMs = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? minutes : ''}`
    }
    return `${minutes} min`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Webinaires Gratuits
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Participez à nos sessions interactives en direct via Microsoft Teams
            </p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 text-sm"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>100% Gratuit</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sessions en direct</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Questions-Réponses</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Data Source Indicator */}
      {dataSource !== 'unknown' && (
        <section className="py-4 bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              {dataSource === 'microsoft-graph' ? (
                <>
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 font-medium">Données en temps réel depuis Microsoft Graph</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-700 font-medium">Données de démonstration (aucun événement dans votre calendrier Microsoft)</span>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Information Banner */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">
                    Comment participer aux webinaires gratuits ?
                  </h3>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span><strong>Choisissez votre webinaire</strong> et cliquez sur "Demander l'accès"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span><strong>Créez un compte invité Microsoft</strong> (gratuit et rapide)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span><strong>Recevez votre invitation par email</strong> après approbation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span><strong>Rejoignez le webinaire</strong> via Microsoft Teams le jour J</span>
                    </li>
                  </ol>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Note :</strong> Les webinaires sont 100% gratuits. Vous aurez besoin d'un compte Microsoft pour y participer. L'inscription se fait via le système d'invitation Microsoft pour garantir la sécurité et la qualité des sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Webinars List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Chargement des webinaires...</p>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && webinars.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucun webinaire disponible
              </h3>
              <p className="text-gray-600">
                De nouveaux webinaires seront bientôt disponibles. Revenez plus tard !
              </p>
            </div>
          )}

          {!loading && !error && webinars.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {webinars.map((webinar, index) => (
                <motion.div
                  key={webinar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  {/* Webinar Header */}
                  <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white">
                    <h3 className="text-xl font-bold text-white mb-3 leading-tight">{webinar.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-white text-sm bg-white/10 px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{formatDuration(webinar.startDate, webinar.endDate)}</span>
                      </div>
                      {webinar.meetingUrl && (
                        <div className="flex items-center gap-1.5 text-white text-xs bg-white/10 px-2.5 py-1.5 rounded-full">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                          </svg>
                          <span className="font-medium">Teams</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Webinar Body */}
                  <div className="p-6 space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                      {webinar.description}
                    </p>

                    {/* Date and Attendees Info */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{formatDate(webinar.startDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-medium">{webinar.registrationCount} / {webinar.maxAttendees}</span>
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                          webinar.registrationCount >= webinar.maxAttendees 
                            ? 'bg-red-100 text-red-700' 
                            : webinar.registrationCount > webinar.maxAttendees * 0.7
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {webinar.registrationCount >= webinar.maxAttendees 
                            ? 'Complet' 
                            : `${webinar.maxAttendees - webinar.registrationCount} places`}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {webinar.tags && webinar.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {webinar.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Register Button */}
                    <button
                      onClick={() => handleRegister(webinar.id, webinar.title)}
                      disabled={registering === webinar.id}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {registering === webinar.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Redirection...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Demander l'accès</span>
                          </div>
                          <span className="text-xs opacity-90 mt-1">Invitation Microsoft requise</span>
                        </div>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

