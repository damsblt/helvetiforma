import { NextRequest, NextResponse } from 'next/server'
import { inviteGuestUser, addGuestToEvent } from '@/lib/microsoft'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: 'Email et nom requis' },
        { status: 400 }
      )
    }

    // Step 1: Invite the guest user to the organization
    const invitationResult = await inviteGuestUser(
      email,
      name,
      'https://myaccount.microsoft.com/'
    )

    if (!invitationResult.success) {
      return NextResponse.json(
        { success: false, message: invitationResult.message },
        { status: 500 }
      )
    }

    // Step 2: Add the guest to the specific calendar event
    const eventResult = await addGuestToEvent(id, email, name)

    if (!eventResult.success) {
      // Guest invitation succeeded but adding to event failed
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invitation envoyée mais erreur lors de l\'ajout à l\'événement',
          details: eventResult.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation envoyée avec succès ! L\'utilisateur recevra un email avec le lien Teams.',
      inviteRedeemUrl: invitationResult.inviteRedeemUrl
    })

  } catch (error) {
    console.error('Error in guest invitation:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}


