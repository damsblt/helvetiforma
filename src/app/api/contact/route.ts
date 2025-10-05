import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json()

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create transporter using the new email configuration
    const emailConfig = {
      host: process.env.EMAIL_SERVER_HOST || 'asmtp.mail.hostpoint.ch',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER || 'contact@helvetiforma.ch',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'Contactformation2025*',
      },
    }

    console.log('📧 Email configuration:', {
      host: emailConfig.host,
      port: emailConfig.port,
      user: emailConfig.auth.user,
      passwordSet: !!emailConfig.auth.pass
    })

    const transporter = nodemailer.createTransport(emailConfig)

    // Email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Nouveau message de contact - HelvetiForma
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Informations du contact</h3>
          <p><strong>Nom:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          ${formData.phone ? `<p><strong>Téléphone:</strong> <a href="tel:${formData.phone}">${formData.phone}</a></p>` : ''}
          ${formData.company ? `<p><strong>Entreprise:</strong> ${formData.company}</p>` : ''}
        </div>

        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #1e40af; margin-top: 0;">Message</h3>
          <p><strong>Sujet:</strong> ${formData.subject}</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${formData.message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
          <p>Ce message a été envoyé depuis le formulaire de contact du site HelvetiForma.</p>
          <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Zurich' })}</p>
        </div>
      </div>
    `

    const textContent = `
Nouveau message de contact - HelvetiForma

Informations du contact:
- Nom: ${formData.name}
- Email: ${formData.email}
${formData.phone ? `- Téléphone: ${formData.phone}` : ''}
${formData.company ? `- Entreprise: ${formData.company}` : ''}
${formData.interest ? `- Domaine d'intérêt: ${formData.interest}` : ''}

Message:
- Sujet: ${formData.subject}
- Contenu: ${formData.message}

Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Zurich' })}
    `

    // Send email
    const mailOptions = {
      from: `"HelvetiForma Contact Form" <${process.env.EMAIL_SERVER_USER || 'contact@helvetiforma.ch'}>`,
      to: 'contact@helvetiforma.ch',
      replyTo: formData.email,
      subject: `[Contact Form] ${formData.subject}`,
      text: textContent,
      html: htmlContent,
    }

    // Test connection first
    try {
      await transporter.verify()
      console.log('✅ Email server connection verified')
    } catch (verifyError) {
      console.error('❌ Email server connection failed:', verifyError)
      return NextResponse.json(
        { error: 'Email server connection failed' },
        { status: 500 }
      )
    }

    // Send email
    try {
      const result = await transporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully:', result.messageId)
      
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      )
    } catch (sendError) {
      console.error('❌ Error sending email:', sendError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
