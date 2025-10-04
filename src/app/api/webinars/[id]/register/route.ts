import { NextRequest, NextResponse } from 'next/server'
import { getTeamsWebinar } from '@/lib/microsoft'

/**
 * POST /api/webinars/[id]/register
 * Inscrit l'utilisateur à un webinaire
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userEmail, userName } = body

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User email is required',
        },
        { status: 400 }
      )
    }

    // Vérifier si le webinaire existe
    const webinar = await getTeamsWebinar(id)
    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webinar not found',
        },
        { status: 404 }
      )
    }

    // Pour l'instant, on simule l'inscription
    // Dans une vraie implémentation, on inscrirait l'utilisateur via Microsoft Graph
    const registration = {
      id: `reg_${Date.now()}`,
      webinarId: id,
      userEmail,
      userName: userName || 'Unknown User',
      registeredAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for webinar',
    })
  } catch (error) {
    console.error(`Error registering for webinar:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register for webinar',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/webinars/[id]/register
 * Désinscrit l'utilisateur d'un webinaire
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User email is required',
        },
        { status: 400 }
      )
    }

    // Pour l'instant, on retourne un succès
    // Dans une vraie implémentation, on désinscrirait l'utilisateur
    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from webinar',
    })
  } catch (error) {
    console.error(`Error unregistering from webinar:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unregister from webinar',
      },
      { status: 500 }
    )
  }
}