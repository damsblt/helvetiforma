import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  try {
    console.log('🔍 Testing email server connection...')
    
    // Create transporter using the same config as NextAuth
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Verify connection configuration
    await transporter.verify()
    
    console.log('✅ Email server connection successful')
    
    return NextResponse.json({
      success: true,
      message: 'Email server connection successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Email server connection failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
