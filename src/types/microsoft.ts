// Types pour l'intégration Microsoft Graph/Teams

export interface TeamsWebinar {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  meetingUrl: string
  attendees: string[]
  maxAttendees: number
  registrationCount: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  isPublic: boolean
  tags: string[]
  instructor?: {
    name: string
    email: string
    bio?: string
  }
  thumbnail?: string
  recording_url?: string
}

export interface WebinarRegistration {
  id: string
  webinarId: string
  userEmail: string
  userName: string
  registeredAt: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended'
  reminderSent?: boolean
  attendedAt?: Date
}

export interface CalendarEvent {
  id: string
  subject: string
  body: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: {
    displayName: string
    address?: string
  }
  attendees: Array<{
    emailAddress: {
      address: string
      name: string
    }
    status: {
      response: 'none' | 'accepted' | 'declined' | 'tentativelyAccepted'
      time: string
    }
  }>
  isOnlineMeeting: boolean
  onlineMeeting?: {
    joinUrl: string
    conferenceId: string
    tollNumber: string
    tollFreeNumbers: string[]
  }
  organizer: {
    emailAddress: {
      address: string
      name: string
    }
  }
  createdDateTime: string
  lastModifiedDateTime: string
}

export interface MicrosoftUser {
  id: string
  displayName: string
  givenName: string
  surname: string
  email: string
  userPrincipalName: string
  jobTitle?: string
  department?: string
  companyName?: string
  profilePhoto?: string
}

export interface TeamsChannel {
  id: string
  displayName: string
  description?: string
  email?: string
  webUrl: string
  membershipType: 'standard' | 'private'
}

export interface TeamsMessage {
  id: string
  createdDateTime: string
  lastModifiedDateTime: string
  subject?: string
  body: {
    contentType: 'text' | 'html'
    content: string
  }
  from: {
    user: {
      id: string
      displayName: string
      userIdentityType: string
    }
  }
  attachments: Array<{
    id: string
    contentType: string
    name: string
    contentUrl: string
  }>
}

// Types pour les réponses API Microsoft Graph
export interface GraphApiResponse<T> {
  '@odata.context': string
  '@odata.nextLink'?: string
  value: T[]
}

export interface GraphError {
  error: {
    code: string
    message: string
    innerError?: {
      code: string
      message: string
      'request-id': string
      date: string
    }
  }
}

// Types pour l'authentification Microsoft
export interface MicrosoftTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
  id_token?: string
}

export interface MicrosoftAuthConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  redirectUri: string
  scopes: string[]
}

// Types pour les notifications et webhooks
export interface WebhookNotification {
  subscriptionId: string
  subscriptionExpirationDateTime: string
  changeType: 'created' | 'updated' | 'deleted'
  resource: string
  resourceData: {
    '@odata.type': string
    '@odata.id': string
    id: string
  }
  clientState?: string
  tenantId: string
}

export interface WebhookSubscription {
  id: string
  resource: string
  changeType: string
  clientState?: string
  notificationUrl: string
  expirationDateTime: string
  applicationId: string
  creatorId: string
}

// Types pour les statistiques Teams
export interface WebinarStats {
  totalWebinars: number
  totalRegistrations: number
  totalAttendees: number
  averageAttendance: number
  upcomingWebinars: number
  completedWebinars: number
  popularWebinars: TeamsWebinar[]
  registrationTrends: Array<{
    date: string
    registrations: number
    attendees: number
  }>
}

export interface AttendanceReport {
  webinarId: string
  webinarTitle: string
  startDate: Date
  endDate: Date
  totalRegistered: number
  totalAttended: number
  attendanceRate: number
  attendees: Array<{
    userEmail: string
    userName: string
    joinTime: Date
    leaveTime: Date
    duration: number
  }>
}

// Types pour la gestion des permissions
export interface TeamsPermission {
  id: string
  roles: Array<'owner' | 'member' | 'guest'>
  grantedTo: {
    user: {
      id: string
      displayName: string
      email: string
    }
  }
  invitation?: {
    email: string
    invitedBy: {
      user: {
        id: string
        displayName: string
      }
    }
    invitedDateTime: string
  }
}

// Types pour les fichiers partagés
export interface TeamsFile {
  id: string
  name: string
  size: number
  webUrl: string
  downloadUrl: string
  createdDateTime: string
  lastModifiedDateTime: string
  createdBy: {
    user: {
      id: string
      displayName: string
    }
  }
  lastModifiedBy: {
    user: {
      id: string
      displayName: string
    }
  }
  parentReference: {
    driveId: string
    driveType: string
    path: string
  }
}

// Types pour la recherche
export interface SearchQuery {
  query: string
  entityTypes: Array<'message' | 'chatMessage' | 'event' | 'drive' | 'driveItem'>
  from?: Date
  to?: Date
  size?: number
}

export interface SearchResult {
  searchTerms: string[]
  hitsContainers: Array<{
    hits: Array<{
      hitId: string
      rank: number
      summary: string
      resource: any
    }>
    total: number
    moreResultsAvailable: boolean
  }>
}
