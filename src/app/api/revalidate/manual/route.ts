import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    if (path) {
      // Revalidate specific path
      revalidatePath(path)
      console.log(`Manual revalidation: ${path}`)
      
      return NextResponse.json({ 
        revalidated: true, 
        path,
        timestamp: new Date().toISOString()
      })
    } else {
      // Revalidate all pages
      revalidateTag('pages')
      revalidatePath('/')
      revalidatePath('/concept')
      console.log('Manual revalidation: all pages')
      
      return NextResponse.json({ 
        revalidated: true, 
        paths: ['/', '/concept'],
        timestamp: new Date().toISOString()
      })
    }
  } catch (err) {
    console.error('Error in manual revalidation:', err)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Manual revalidation endpoint',
    usage: 'POST with { "path": "/" } or {} for all pages',
    timestamp: new Date().toISOString()
  })
}
