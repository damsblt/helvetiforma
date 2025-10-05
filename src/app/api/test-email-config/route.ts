import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email-service'

export async function GET() {
  try {
    console.log('🔍 Testing email configuration...')
    console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST)
    console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT)
    console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('EMAIL_SERVER_PASSWORD:', process.env.EMAIL_SERVER_PASSWORD ? '***SET***' : 'NOT SET')

    const isConnected = await testEmailConnection()

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Email configuration is working correctly',
        config: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          user: process.env.EMAIL_SERVER_USER,
          from: process.env.EMAIL_FROM,
          passwordSet: !!process.env.EMAIL_SERVER_PASSWORD
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email configuration failed',
        config: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          user: process.env.EMAIL_SERVER_USER,
          from: process.env.EMAIL_FROM,
          passwordSet: !!process.env.EMAIL_SERVER_PASSWORD
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error testing email configuration:', error)
    return NextResponse.json({
      success: false,
      message: 'Error testing email configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
