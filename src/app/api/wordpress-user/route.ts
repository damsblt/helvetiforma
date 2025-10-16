import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookies = request.headers.get('cookie')
    
    // Try to get the current user from WordPress session using cookies
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const user = await response.json()
      
      if (user && user.id) {
        return NextResponse.json({
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          display_name: user.display_name
        })
      }
    }
    
    return NextResponse.json(
      { error: 'No WordPress session found' },
      { status: 401 }
    )
  } catch (error) {
    console.error('❌ Error getting WordPress user:', error)
    return NextResponse.json(
      { error: 'No WordPress session found' },
      { status: 401 }
    )
  }
}
