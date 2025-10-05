import { NextRequest, NextResponse } from 'next/server'
import { sendRegistrationConfirmation } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, userName, loginUrl } = body

    // Validate required fields
    if (!userEmail || !userName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userEmail and userName' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      )
    }

    // Send registration confirmation email
    const success = await sendRegistrationConfirmation({
      userEmail,
      userName,
      registrationDate: new Date(),
      loginUrl: loginUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/login`
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Registration confirmation email sent successfully'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send registration confirmation email' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending registration confirmation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
