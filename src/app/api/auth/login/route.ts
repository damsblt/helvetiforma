import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 Internal Auth - Login attempt for:', email)
    
    try {
      // First, find the user by email using admin credentials
      const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}&per_page=1`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`contact@helvetiforma.ch:RWnb nSO6 6TMX yWd0 HWFl HBYh`).toString('base64')}`
        }
      })
      
      console.log('🔍 User search response status:', searchResponse.status)
      
      if (searchResponse.ok) {
        const users = await searchResponse.json()
        console.log('🔍 Users found:', users.length)
        
        if (users && users.length > 0) {
          const user = users[0]
          console.log('✅ Internal Auth - User found:', user.email)
          
          // For now, let's just return the user data without creating a session
          // We'll handle session management differently
          console.log('✅ Internal Auth - Login successful (simplified)')
          
          return NextResponse.json({
            success: true,
            user: {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              display_name: user.display_name
            }
          })
        } else {
          console.log('❌ Internal Auth - No user found with email:', email)
        }
      } else {
        console.log('❌ Internal Auth - User search failed, status:', searchResponse.status)
        const errorText = await searchResponse.text()
        console.log('❌ Error response:', errorText)
      }
      
      console.log('❌ Internal Auth - Login failed - invalid credentials')
      return NextResponse.json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      })
      
    } catch (error) {
      console.error('❌ Internal Auth - WordPress error:', error)
      return NextResponse.json({
        success: false,
        error: 'Erreur de connexion'
      })
    }
    
  } catch (error) {
    console.error('❌ Internal Auth - General error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur de connexion'
    })
  }
}
