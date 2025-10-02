import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify this is a Sanity webhook (optional security check)
    const secret = request.headers.get('sanity-webhook-secret')
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Get the document type and ID from the webhook payload
    const { _type, _id, slug } = body

    console.log('Sanity webhook received:', { _type, _id, slug })

    if (_type === 'page') {
      // Revalidate the specific page
      if (slug?.current) {
        revalidatePath(`/${slug.current}`)
        console.log(`Revalidated page: /${slug.current}`)
      }
      
      // Also revalidate the homepage if this is the home page
      if (slug?.current === 'home') {
        revalidatePath('/')
        console.log('Revalidated homepage')
      }
    }

    // Revalidate all pages tag to ensure fresh content
    revalidateTag('pages')
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      paths: _type === 'page' ? [`/${slug?.current || 'home'}`] : []
    })
  } catch (err) {
    console.error('Error revalidating:', err)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Sanity revalidation webhook is active',
    timestamp: new Date().toISOString()
  })
}
