import { NextRequest, NextResponse } from 'next/server'

import { autoRegisterMicrosoftUser, isPersonalMicrosoftAccount } from '@/lib/microsoft'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email: providedEmail, name: providedName } = body
    
    // Utiliser les paramètres fournis
    const userEmail = providedEmail
    const userName = providedName || userEmail?.split('@')[0]
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      )
    }

    // Vérifier si c'est un compte Microsoft personnel
    if (!isPersonalMicrosoftAccount(userEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cette fonctionnalité est réservée aux comptes Microsoft personnels (Outlook, Hotmail, etc.)' 
        },
        { status: 400 }
      )
    }

    // Pour les comptes Microsoft personnels, utiliser l'invitation guest standard
    // car ils ne peuvent pas se connecter directement à Entra ID
    const { inviteGuestUser, addGuestToEvent } = await import('@/lib/microsoft')
    
    // Step 1: Invite the guest user to the organization
    const invitationResult = await inviteGuestUser(
      userEmail,
      userName,
      'https://myaccount.microsoft.com/'
    )

    if (!invitationResult.success) {
      return NextResponse.json(
        { success: false, message: invitationResult.message },
        { status: 500 }
      )
    }

    // Step 2: Add the guest to the specific calendar event
    const eventResult = await addGuestToEvent(id, userEmail, userName)

    if (!eventResult.success) {
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
      message: 'Inscription automatique réussie ! Vous recevrez une invitation Teams dans votre calendrier Microsoft.',
      inviteRedeemUrl: invitationResult.inviteRedeemUrl,
      userEmail: userEmail
    })

  } catch (error) {
    console.error('Error in auto-registration:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
