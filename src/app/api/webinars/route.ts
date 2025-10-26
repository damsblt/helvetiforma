import { NextRequest, NextResponse } from 'next/server'
import { getTeamsWebinars, createTeamsWebinar } from '@/lib/microsoft'

/**
 * GET /api/webinars
 * Liste tous les webinaires publics depuis le calendrier Microsoft (utilise les credentials de l'application)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
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

    return NextResponse.json({
      success: true,
      data: webinars,
      count: webinars.length,
      source: 'microsoft-graph-public',
    })
  } catch (error) {
    console.error('Error fetching webinars:', error)
    // Don't hide the error - return it so we can debug
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'error',
      message: 'Failed to fetch webinars from Microsoft Teams. Check console for details.',
    }, { status: 500 })
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

