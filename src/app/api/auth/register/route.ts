import { NextRequest, NextResponse } from 'next/server'
import { wordpressClient } from '@/lib/wordpress'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()
    
    console.log('🔍 Internal Auth - Registration attempt for:', email)
    
    try {
      // Create user via WordPress REST API with proper authentication
      const userData = {
        username: email,
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
        roles: ['subscriber'] // Default role
      }
      
      // Use application password for user creation
      const auth = Buffer.from(`${process.env.WORDPRESS_APP_USER || 'contact@helvetiforma.ch'}:${process.env.WORDPRESS_APP_PASSWORD || 'RWnb nSO6 6TMX yWd0 HWFl HBYh'}`).toString('base64')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(userData)
      })
      
      console.log('🔍 WordPress API Response Status:', response.status)
      const userResponse = await response.json()
      console.log('🔍 WordPress API Response:', userResponse)
      
      if (response.ok && userResponse && userResponse.id) {
        console.log('✅ Internal Auth - Registration successful')
        
        // For now, just return the user data without creating a session
        return NextResponse.json({
          success: true,
          user: {
            id: userResponse.id.toString(),
            email: userResponse.email,
            name: userResponse.name,
            display_name: userResponse.display_name
          }
        })
      }
      
      console.log('❌ Internal Auth - Registration failed')
      console.log('❌ Response status:', response.status)
      console.log('❌ Response body:', userResponse)
      
      // Handle specific WordPress errors
      if (userResponse.code === 'existing_user_email' || userResponse.message?.includes('email')) {
        return NextResponse.json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        })
      }
      
      return NextResponse.json({
        success: false,
        error: userResponse.message || 'Erreur lors de l\'inscription'
      })
      
    } catch (error: any) {
      console.error('❌ Internal Auth - Registration error:', error)
      
      // Handle specific WordPress errors
      if (error.code === 'existing_user_email' || error.message?.includes('email')) {
        return NextResponse.json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        })
      }
      
      return NextResponse.json({
        success: false,
        error: error.message || 'Erreur lors de l\'inscription'
      })
    }
    
  } catch (error) {
    console.error('❌ Internal Auth - General error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    })
  }
}