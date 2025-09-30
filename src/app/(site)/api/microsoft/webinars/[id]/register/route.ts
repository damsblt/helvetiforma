import { NextRequest, NextResponse } from 'next/server'
import { registerForWebinar, unregisterFromWebinar, getTeamsWebinar, canRegisterForWebinar } from '@/lib/microsoft'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const body = await request.json()
    const webinarId = resolvedParams.id
    
    // Validation des données requises
    if (!body.userEmail || !body.userName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'userEmail and userName are required'
        },
        { status: 400 }
      )
    }

    // Vérifier que le webinaire existe
    const webinar = await getTeamsWebinar(webinarId)
    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webinar not found',
          message: `Webinar with ID ${webinarId} does not exist`
        },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur peut s'inscrire
    const registrationCheck = canRegisterForWebinar(webinar, body.userEmail)
    if (!registrationCheck.canRegister) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration not allowed',
          message: registrationCheck.reason
        },
        { status: 400 }
      )
    }

    // Procéder à l'inscription
    const registration = await registerForWebinar(
      webinarId,
      body.userEmail,
      body.userName
    )
    
    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration failed',
          message: 'Could not register for the webinar'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for the webinar'
    }, { status: 201 })
  } catch (error) {
    console.error(`API Error - Register for webinar ${resolvedParams.id}:`, error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    const webinarId = resolvedParams.id
    
    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userEmail parameter',
          message: 'userEmail query parameter is required for unregistration'
        },
        { status: 400 }
      )
    }

    // Vérifier que le webinaire existe
    const webinar = await getTeamsWebinar(webinarId)
    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webinar not found',
          message: `Webinar with ID ${webinarId} does not exist`
        },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est bien inscrit
    if (!webinar.attendees.includes(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not registered',
          message: 'User is not registered for this webinar'
        },
        { status: 400 }
      )
    }

    // Procéder à la désinscription
    const success = await unregisterFromWebinar(webinarId, userEmail)
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unregistration failed',
          message: 'Could not unregister from the webinar'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from the webinar'
    })
  } catch (error) {
    console.error(`API Error - Unregister from webinar ${resolvedParams.id}:`, error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Unregistration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
