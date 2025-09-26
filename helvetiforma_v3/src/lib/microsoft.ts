// Microsoft Graph API Integration pour Teams
import { Client } from '@microsoft/microsoft-graph-client'
import { TeamsWebinar, WebinarRegistration, CalendarEvent } from '@/types/microsoft'

// Configuration Microsoft Graph
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || ''
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || ''
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || ''

/**
 * Crée un client Microsoft Graph avec authentification
 */
function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}

/**
 * Obtient un token d'accès pour l'application
 */
async function getApplicationAccessToken(): Promise<string> {
  try {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting Microsoft access token:', error)
    throw error
  }
}

/**
 * Récupère les événements de calendrier (webinaires)
 */
export async function getTeamsWebinars(params?: {
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<TeamsWebinar[]> {
  try {
    // En mode développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return getMockWebinars(params)
    }

    const accessToken = await getApplicationAccessToken()
    const graphClient = createGraphClient(accessToken)

    const startTime = params?.startDate?.toISOString() || new Date().toISOString()
    const endTime = params?.endDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const events = await graphClient
      .api('/me/calendar/events')
      .filter(`start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`)
      .select('id,subject,body,start,end,location,attendees,onlineMeeting')
      .top(params?.limit || 50)
      .get()

    return events.value.map((event: any): TeamsWebinar => ({
      id: event.id,
      title: event.subject,
      description: event.body?.content || '',
      startDate: new Date(event.start.dateTime),
      endDate: new Date(event.end.dateTime),
      meetingUrl: event.onlineMeeting?.joinUrl || '',
      attendees: event.attendees?.map((attendee: any) => attendee.emailAddress.address) || [],
      maxAttendees: 100, // Valeur par défaut
      registrationCount: event.attendees?.length || 0,
      status: 'scheduled',
      isPublic: true,
      tags: ['webinaire', 'formation'],
    }))
  } catch (error) {
    console.error('Error fetching Teams webinars:', error)
    return getMockWebinars(params)
  }
}

/**
 * Récupère un webinaire spécifique par son ID
 */
export async function getTeamsWebinar(id: string): Promise<TeamsWebinar | null> {
  try {
    if (process.env.NODE_ENV === 'development') {
      const mockWebinars = getMockWebinars()
      return mockWebinars.find(w => w.id === id) || null
    }

    const accessToken = await getApplicationAccessToken()
    const graphClient = createGraphClient(accessToken)

    const event = await graphClient
      .api(`/me/calendar/events/${id}`)
      .select('id,subject,body,start,end,location,attendees,onlineMeeting')
      .get()

    return {
      id: event.id,
      title: event.subject,
      description: event.body?.content || '',
      startDate: new Date(event.start.dateTime),
      endDate: new Date(event.end.dateTime),
      meetingUrl: event.onlineMeeting?.joinUrl || '',
      attendees: event.attendees?.map((attendee: any) => attendee.emailAddress.address) || [],
      maxAttendees: 100,
      registrationCount: event.attendees?.length || 0,
      status: 'scheduled',
      isPublic: true,
      tags: ['webinaire', 'formation'],
    }
  } catch (error) {
    console.error(`Error fetching Teams webinar ${id}:`, error)
    return null
  }
}

/**
 * Crée un nouveau webinaire Teams
 */
export async function createTeamsWebinar(webinarData: {
  title: string
  description: string
  startDate: Date
  endDate: Date
  maxAttendees?: number
}): Promise<TeamsWebinar | null> {
  try {
    const accessToken = await getApplicationAccessToken()
    const graphClient = createGraphClient(accessToken)

    const event = {
      subject: webinarData.title,
      body: {
        contentType: 'HTML',
        content: webinarData.description,
      },
      start: {
        dateTime: webinarData.startDate.toISOString(),
        timeZone: 'Europe/Zurich',
      },
      end: {
        dateTime: webinarData.endDate.toISOString(),
        timeZone: 'Europe/Zurich',
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    }

    const createdEvent = await graphClient
      .api('/me/calendar/events')
      .post(event)

    return {
      id: createdEvent.id,
      title: createdEvent.subject,
      description: createdEvent.body?.content || '',
      startDate: new Date(createdEvent.start.dateTime),
      endDate: new Date(createdEvent.end.dateTime),
      meetingUrl: createdEvent.onlineMeeting?.joinUrl || '',
      attendees: [],
      maxAttendees: webinarData.maxAttendees || 100,
      registrationCount: 0,
      status: 'scheduled',
      isPublic: true,
      tags: ['webinaire', 'formation'],
    }
  } catch (error) {
    console.error('Error creating Teams webinar:', error)
    return null
  }
}

/**
 * Inscrit un utilisateur à un webinaire
 */
export async function registerForWebinar(
  webinarId: string,
  userEmail: string,
  userName: string
): Promise<WebinarRegistration | null> {
  try {
    const accessToken = await getApplicationAccessToken()
    const graphClient = createGraphClient(accessToken)

    // Ajouter l'utilisateur comme participant
    const attendee = {
      emailAddress: {
        address: userEmail,
        name: userName,
      },
      type: 'required',
    }

    await graphClient
      .api(`/me/calendar/events/${webinarId}`)
      .patch({
        attendees: [attendee], // En réalité, il faudrait récupérer les participants existants et ajouter le nouveau
      })

    // Envoyer l'invitation
    await graphClient
      .api(`/me/calendar/events/${webinarId}/microsoft.graph.forward`)
      .post({
        toRecipients: [
          {
            emailAddress: {
              address: userEmail,
              name: userName,
            },
          },
        ],
        comment: 'Vous êtes inscrit à ce webinaire HelvetiForma !',
      })

    return {
      id: `${webinarId}_${userEmail}`,
      webinarId,
      userEmail,
      userName,
      registeredAt: new Date(),
      status: 'confirmed',
    }
  } catch (error) {
    console.error('Error registering for webinar:', error)
    return null
  }
}

/**
 * Annule l'inscription d'un utilisateur à un webinaire
 */
export async function unregisterFromWebinar(
  webinarId: string,
  userEmail: string
): Promise<boolean> {
  try {
    const accessToken = await getApplicationAccessToken()
    const graphClient = createGraphClient(accessToken)

    // Récupérer l'événement actuel
    const event = await graphClient
      .api(`/me/calendar/events/${webinarId}`)
      .select('attendees')
      .get()

    // Filtrer les participants pour retirer l'utilisateur
    const updatedAttendees = event.attendees?.filter(
      (attendee: any) => attendee.emailAddress.address !== userEmail
    ) || []

    // Mettre à jour l'événement
    await graphClient
      .api(`/me/calendar/events/${webinarId}`)
      .patch({
        attendees: updatedAttendees,
      })

    return true
  } catch (error) {
    console.error('Error unregistering from webinar:', error)
    return false
  }
}

/**
 * Récupère les inscriptions d'un utilisateur
 */
export async function getUserWebinarRegistrations(userEmail: string): Promise<WebinarRegistration[]> {
  try {
    // En mode développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          id: 'webinar1_user@example.com',
          webinarId: 'webinar1',
          userEmail,
          userName: 'Utilisateur Test',
          registeredAt: new Date(),
          status: 'confirmed',
        },
      ]
    }

    // En production, interroger la base de données Supabase
    // ou l'API Microsoft Graph selon l'implémentation choisie
    return []
  } catch (error) {
    console.error('Error fetching user webinar registrations:', error)
    return []
  }
}

/**
 * Données simulées pour le développement
 */
function getMockWebinars(params?: { startDate?: Date; endDate?: Date; limit?: number }): TeamsWebinar[] {
  const now = new Date()
  const webinars: TeamsWebinar[] = [
    {
      id: 'webinar1',
      title: 'Introduction à la Comptabilité Suisse',
      description: 'Découvrez les bases de la comptabilité selon les normes suisses. Ce webinaire gratuit vous donnera un aperçu complet des principes fondamentaux.',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2h plus tard
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/example1',
      attendees: ['user1@example.com', 'user2@example.com'],
      maxAttendees: 100,
      registrationCount: 23,
      status: 'scheduled',
      isPublic: true,
      tags: ['comptabilité', 'débutant', 'gratuit'],
    },
    {
      id: 'webinar2',
      title: 'Gestion des Salaires : Nouveautés 2024',
      description: 'Webinaire spécialisé sur les dernières évolutions en matière de gestion des salaires en Suisse. Idéal pour les professionnels RH.',
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 1.5h plus tard
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/example2',
      attendees: ['user3@example.com'],
      maxAttendees: 50,
      registrationCount: 12,
      status: 'scheduled',
      isPublic: true,
      tags: ['salaires', 'rh', 'intermédiaire'],
    },
    {
      id: 'webinar3',
      title: 'Session Q&A avec les Experts',
      description: 'Session interactive de questions-réponses avec nos formateurs experts. Apportez vos questions sur la comptabilité et la gestion d\'entreprise.',
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
      endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 1h plus tard
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/example3',
      attendees: [],
      maxAttendees: 30,
      registrationCount: 8,
      status: 'scheduled',
      isPublic: true,
      tags: ['qa', 'interactif', 'experts'],
    },
  ]

  // Filtrer par dates si spécifiées
  let filteredWebinars = webinars
  if (params?.startDate) {
    filteredWebinars = filteredWebinars.filter(w => w.startDate >= params.startDate!)
  }
  if (params?.endDate) {
    filteredWebinars = filteredWebinars.filter(w => w.endDate <= params.endDate!)
  }

  // Limiter le nombre de résultats
  if (params?.limit) {
    filteredWebinars = filteredWebinars.slice(0, params.limit)
  }

  return filteredWebinars
}

/**
 * Valide si un utilisateur peut s'inscrire à un webinaire
 */
export function canRegisterForWebinar(webinar: TeamsWebinar, userEmail?: string): {
  canRegister: boolean
  reason?: string
} {
  if (!webinar.isPublic) {
    return { canRegister: false, reason: 'Ce webinaire n\'est pas public' }
  }

  if (webinar.status !== 'scheduled') {
    return { canRegister: false, reason: 'Ce webinaire n\'est plus disponible' }
  }

  if (webinar.startDate < new Date()) {
    return { canRegister: false, reason: 'Ce webinaire a déjà commencé' }
  }

  if (webinar.registrationCount >= webinar.maxAttendees) {
    return { canRegister: false, reason: 'Ce webinaire est complet' }
  }

  if (userEmail && webinar.attendees.includes(userEmail)) {
    return { canRegister: false, reason: 'Vous êtes déjà inscrit à ce webinaire' }
  }

  return { canRegister: true }
}
