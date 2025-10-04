import { NextRequest, NextResponse } from 'next/server'

import { getTeamsWebinar } from '@/lib/microsoft'

/**
 * GET /api/webinars/[id]
 * Récupère les détails d'un webinaire spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user's access token from session
    // const session = null // Disabled for Supabase // Disabled for Supabase
    const accessToken = undefined // Disabled for Supabase
    
    const webinar = await getTeamsWebinar(id, accessToken)

    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webinar not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: webinar,
    })
  } catch (error) {
    console.error(`Error fetching webinar:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch webinar',
      },
      { status: 500 }
    )
  }
}

