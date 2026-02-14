'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
// Removed Supabase import - using NextAuth instead
import { TeamsWebinar } from '@/types/microsoft'

export default function CalendrierClient() {
  // Removed Supabase client - using NextAuth instead
  const [session, setSession] = useState<any>(null)
  const [webinars, setWebinars] = useState<TeamsWebinar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>('unknown')

  useEffect(() => {
    fetchWebinars()
    // Removed getSession() call - using NextAuth instead
  }, [])

  // Removed Supabase session handling - using NextAuth instead

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

  // Fonction pour détecter les comptes Microsoft personnels
  const isPersonalMicrosoftAccount = (email: string): boolean => {
    const personalMicrosoftDomains = [
      'outlook.com',
      'hotmail.com',
      'live.com',
      'msn.com',
      'passport.com'
    ]
    
    const domain = email.toLowerCase().split('@')[1]
    return personalMicrosoftDomains.includes(domain)
  }

  const handleRegister = async (webinar: TeamsWebinar) => {
    try {
      setRegistering(webinar.id)
      
      // Format date and time for the contact form
      const startDate = new Date(webinar.startDate)
      const endDate = new Date(webinar.endDate)
      const formattedDateTime = formatDate(startDate)
      
      // Determine location based on meeting type
      const location = getEventType(webinar) === 'Réunion Teams' 
        ? 'Réunion Microsoft Teams (en ligne)'
        : 'Événement en personne (lieu à confirmer)'
      
      // Redirection directe vers le formulaire de contact avec pré-remplissage
      // L'API Microsoft Graph ne peut pas ajouter automatiquement des utilisateurs
      // à des événements avec notifications, donc on utilise le formulaire de contact
      const params = new URLSearchParams({
        webinar: webinar.title,
        webinarId: webinar.id,
        webinarDateTime: formattedDateTime,
        webinarLocation: location,
        webinarMeetingUrl: webinar.meetingUrl || ''
      })
      
      window.location.href = `/contact?${params.toString()}#contact-form`
      
    } catch (err) {
      alert('Une erreur est survenue lors de la redirection')
      console.error(err)
    } finally {
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

  const getEventType = (webinar: TeamsWebinar) => {
    // Check if it's a Teams meeting based on meetingUrl
    const isTeamsMeeting = webinar.meetingUrl && webinar.meetingUrl.includes('teams.microsoft.com')
    
    // Check if it's explicitly marked as in-person event
    const isExplicitlyInPerson = webinar.title.toLowerCase().includes('[en personne]') || 
                                 webinar.title.toLowerCase().includes('en personne') ||
                                 webinar.description.toLowerCase().includes('en personne')
    
    // If it has a Teams meeting URL, it's a Teams meeting
    if (isTeamsMeeting) {
      return 'Réunion Teams'
    }
    
    // If it's explicitly marked as in-person, it's in-person
    if (isExplicitlyInPerson) {
      return 'Événement en personne'
    }
    
    // If it has a meetingUrl but not Teams (like Outlook), it's likely in-person
    if (webinar.meetingUrl && !isTeamsMeeting) {
      return 'Événement en personne'
    }
    
    // Default to in-person if no clear indication
    return 'Événement en personne'
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat('fr-CH', {
      timeStyle: 'short',
    }).format(d)
  }

  const getEventColorScheme = (title: string) => {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('salaires') || lowerTitle.includes('salaire')) {
      return {
        header: 'from-blue-500 via-blue-600 to-blue-700',
        icon: 'text-blue-600',
        button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
      }
    } else if (lowerTitle.includes('sociales')) {
      return {
        header: 'from-green-500 via-green-600 to-green-700',
        icon: 'text-green-600',
        button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
      }
    } else if (lowerTitle.includes('source')) {
      return {
        header: 'from-purple-500 via-purple-600 to-purple-700',
        icon: 'text-purple-600',
        button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
      }
    } else {
      // Couleur par défaut (orange)
      return {
        header: 'from-orange-500 via-orange-600 to-orange-700',
        icon: 'text-orange-600',
        button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
      }
    }
  }

  const extractPrice = (description: string): { price: string | null; cleanDescription: string } => {
    if (!description) return { price: null, cleanDescription: description }
    
    // Recherche de patterns de prix : "Prix : 300 CHF", "Prix: 300 CHF", "300 CHF", etc.
    const pricePatterns = [
      /Prix\s*:\s*(\d+(?:\s*,\s*\d{3})*(?:\s*\.\s*\d{2})?)\s*CHF/i,
      /(\d+(?:\s*,\s*\d{3})*(?:\s*\.\s*\d{2})?)\s*CHF/i,
      /Prix\s*:\s*(\d+(?:\s*,\s*\d{3})*(?:\s*\.\s*\d{2})?)\s*fr/i,
      /(\d+(?:\s*,\s*\d{3})*(?:\s*\.\s*\d{2})?)\s*fr/i
    ]
    
    let cleanDescription = description
    let extractedPrice: string | null = null
    
    for (const pattern of pricePatterns) {
      const match = description.match(pattern)
      if (match) {
        const amount = match[1].replace(/\s+/g, '') // Supprime les espaces
        extractedPrice = `${amount} CHF`
        // Supprime la partie prix de la description
        cleanDescription = description.replace(pattern, '').replace(/\s+/g, ' ').trim()
        break
      }
    }
    
    return { price: extractedPrice, cleanDescription }
  }

  return (
    <>
      {/* Data Source Indicator */}
      {dataSource !== 'unknown' && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm">
            {dataSource === 'microsoft-graph-public' ? (
              <>
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-700 dark:text-green-400 font-medium">Données en temps réel depuis Microsoft Graph</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-700 dark:text-blue-400 font-medium">Aucun événement dans votre calendrier Microsoft</span>
              </>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-white">Chargement des webinaires...</p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && webinars.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun webinaire disponible
          </h3>
          <p className="text-gray-600 dark:text-white">
            De nouveaux webinaires seront bientôt disponibles. Revenez plus tard !
          </p>
        </div>
      )}

      {!loading && !error && webinars.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {webinars.map((webinar, index) => {
            const colorScheme = getEventColorScheme(webinar.title)
            const { price, cleanDescription } = extractPrice(webinar.description)
            return (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600"
              >
                {/* Section 1: Titre de l'événement avec temps */}
                <div className={`bg-gradient-to-br ${colorScheme.header} p-6 text-white`}>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">{webinar.title}</h3>
                  <div className="bg-white/10 rounded-lg px-3 py-2 inline-block">
                    <span className="text-sm font-medium">Temps de l'événement: {formatDuration(webinar.startDate, webinar.endDate)}</span>
                  </div>
                </div>

                {/* Section 2: Date et heure du début */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-white font-medium">Date et heure du début</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white mt-1 ml-8">{formatDate(webinar.startDate)}</p>
                </div>

                {/* Section 3: Type d'événement */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700 dark:text-white font-medium">Type d'événement</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white mt-1 ml-8">{getEventType(webinar)}</p>
                </div>

                {/* Section 4: Description */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-white font-medium">Description</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white mt-1 ml-8 line-clamp-3">
                    {cleanDescription && cleanDescription !== 'Aucune description disponible' 
                      ? cleanDescription 
                      : 'Aucune description disponible'}
                  </p>
                </div>

                {/* Section 5: Prix (si disponible) */}
                {price && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <svg className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-gray-700 dark:text-white font-medium">Prix</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white mt-1 ml-8 font-semibold">
                      {price}
                    </p>
                  </div>
                )}

                {/* Section 6: Bouton d'inscription */}
                <div className="p-4">
                  <button
                    onClick={() => handleRegister(webinar)}
                    disabled={registering === webinar.id}
                    className={`w-full py-3 bg-gradient-to-r ${colorScheme.button} disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {registering === webinar.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>S'inscrire...</span>
                      </div>
                    ) : (
                      <span>S'inscrire</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}