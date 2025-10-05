import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Create Sanity client with token for write operations
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      token: process.env.SANITY_API_TOKEN!,
      useCdn: false,
      apiVersion: '2023-05-03'
    })

    // Check if user already exists
    const existingUsers = await client.fetch(
      `*[_type == "user" && email == $email]`,
      { email }
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Create new user in Sanity
    const user = await client.create({
      _type: 'user',
      email,
      password, // In production, this should be hashed
      first_name: first_name || '',
      last_name: last_name || '',
      name: `${first_name || ''} ${last_name || ''}`.trim() || email,
      createdAt: new Date().toISOString()
    })

    console.log('✅ User created in Sanity:', {
      userId: user._id,
      email: user.email
    })

    return NextResponse.json({
      success: true,
      userId: user._id
    })

  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
