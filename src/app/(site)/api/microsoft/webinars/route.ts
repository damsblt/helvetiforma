import { NextRequest, NextResponse } from 'next/server'
import { getTeamsWebinars, createTeamsWebinar } from '@/lib/microsoft'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    }

    const webinars = await getTeamsWebinars(params)

    return NextResponse.json({
      success: true,
      data: webinars,
      count: webinars.length
    })
  } catch (error) {
    console.error('API Error - Microsoft webinars:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch webinars',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données requises
    const requiredFields = ['title', 'description', 'startDate', 'endDate']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
            message: `The field '${field}' is required to create a webinar`
          },
          { status: 400 }
        )
      }
    }

    const webinarData = {
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      maxAttendees: body.maxAttendees || 100,
    }

    // Validation des dates
    if (webinarData.startDate >= webinarData.endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid dates',
          message: 'Start date must be before end date'
        },
        { status: 400 }
      )
    }

    if (webinarData.startDate < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid start date',
          message: 'Start date must be in the future'
        },
        { status: 400 }
      )
    }

    const webinar = await createTeamsWebinar(webinarData)
    
    if (!webinar) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create webinar',
          message: 'Could not create webinar in Microsoft Teams'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: webinar,
      message: 'Webinar created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('API Error - Create webinar:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create webinar',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
