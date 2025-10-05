import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 Debug login attempt:', { email })
    
    // Check if user exists in Sanity
    const users = await sanityClient.fetch(
      `*[_type == "user" && email == $email]`,
      { email }
    )
    
    console.log('🔍 Users found:', users.length)
    
    if (users.length > 0) {
      const user = users[0]
      console.log('🔍 User found:', { id: user._id, email: user.email, hasPassword: !!user.password })
      
      // Check password (in production, this should be hashed comparison)
      if (user.password === password) {
        return NextResponse.json({
          success: true,
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid password'
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      })
    }
    
  } catch (error) {
    console.error('❌ Debug login error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
