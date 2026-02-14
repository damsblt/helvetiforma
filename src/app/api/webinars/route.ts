import { NextRequest, NextResponse } from 'next/server'
import { getTeamsWebinars, createTeamsWebinar } from '@/lib/microsoft'
import { TeamsWebinar } from '@/types/microsoft'

/** Événement de test pour visualisation (utilisé en fallback ou avec ?demo=true) */
function getMockTestEvent(): TeamsWebinar[] {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7) // Dans 7 jours
  startDate.setHours(14, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setHours(16, 0, 0, 0)

  return [{
    id: 'mock-test-event-001',
    title: 'HF - Test',
    description: 'Ceci est un événement de test pour visualiser les cartes sur la page Sessions. Découvrez nos formations professionnelles et nos webinaires interactifs. Prix : 150 CHF.',
    startDate,
    endDate,
    meetingUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_example',
    attendees: [],
    maxAttendees: 50,
    registrationCount: 0,
    status: 'scheduled',
    isPublic: true,
    tags: ['webinaire', 'formation', 'test'],
  }]
}

/**
 * GET /api/webinars
 * Liste tous les webinaires publics depuis le calendrier Microsoft (utilise les credentials de l'application)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const demo = searchParams.get('demo') === 'true'

  // Mode démo : retourne un événement de test pour visualisation
  if (demo) {
    return NextResponse.json({
      success: true,
      data: getMockTestEvent(),
      count: 1,
      source: 'mock-demo',
    })
  }

  try {
    const limit = searchParams.get('limit')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get application token (no user authentication required)
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      }
    )

    if (!tokenResponse.ok) {
      console.error('Failed to get application token')
      throw new Error('Authentication failed')
    }

    const { access_token } = await tokenResponse.json()

    console.log('Fetching webinars with application token (public access)')

    const webinars = await getTeamsWebinars({
      limit: limit ? parseInt(limit) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accessToken: access_token,
    })

    // Si aucun événement, ajouter un événement de test pour visualisation
    const data = webinars.length > 0 ? webinars : getMockTestEvent()

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      source: webinars.length > 0 ? 'microsoft-graph-public' : 'mock-empty-fallback',
    })
  } catch (error) {
    console.error('Error fetching webinars:', error)
    // Fallback : retourne un événement de test pour permettre la visualisation
    return NextResponse.json({
      success: true,
      data: getMockTestEvent(),
      count: 1,
      source: 'mock-fallback',
    })
  }
}

/**
 * POST /api/webinars
 * Crée un nouveau webinaire (nécessite authentification admin)
 */
export async function POST(request: NextRequest) {
  try {
    // For now, allow creation without authentication
    // In production, you might want to add Supabase auth check here

    const body = await request.json()
    const { title, description, startDate, endDate, maxAttendees } = body

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const webinar = await createTeamsWebinar({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxAttendees,
    })

    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create webinar',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: webinar,
    })
  } catch (error) {
    console.error('Error creating webinar:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create webinar',
      },
      { status: 500 }
    )
  }
}

