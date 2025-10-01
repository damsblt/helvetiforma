import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { registerForWebinar, getTeamsWebinar, canRegisterForWebinar } from '@/lib/microsoft'

/**
 * POST /api/webinars/[id]/register
 * Inscrit l'utilisateur connecté à un webinaire
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    const userName = session.user.name || 'Unknown User'

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User email not found',
        },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur peut s'inscrire
    const webinar = await getTeamsWebinar(id, session.accessToken)
    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webinar not found',
        },
        { status: 404 }
      )
    }

    const { canRegister, reason } = canRegisterForWebinar(webinar, userEmail)
    if (!canRegister) {
      return NextResponse.json(
        {
          success: false,
          error: reason || 'Cannot register for this webinar',
        },
        { status: 400 }
      )
    }

    // Inscrire l'utilisateur
    const registration = await registerForWebinar(id, userEmail, userName)

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to register for webinar',
        },
        { status: 500 }
      )
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
 * Annule l'inscription de l'utilisateur à un webinaire
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User email not found',
        },
        { status: 400 }
      )
    }

    const { unregisterFromWebinar } = await import('@/lib/microsoft')
    const success = await unregisterFromWebinar(id, userEmail)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to unregister from webinar',
        },
        { status: 500 }
      )
    }

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

