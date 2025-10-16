import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Internal Auth - Logout request')
    
    // Clear any local session data
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })
    
    // Clear cookies by setting them to expire
    response.headers.set('Set-Cookie', [
      'wordpress_logged_in_*; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'wordpress_*; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'wp-settings-*; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'wp-postpass_*; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    ].join(', '))
    
    return response
    
  } catch (error) {
    console.error('❌ Internal Auth - Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    })
  }
}
