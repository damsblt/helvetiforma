import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing email configuration...')
    
    const emailConfig = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM,
      hasPassword: !!process.env.EMAIL_SERVER_PASSWORD
    }
    
    console.log('📧 Email config:', emailConfig)
    
    return NextResponse.json({
      success: true,
      emailConfig,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Email test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
