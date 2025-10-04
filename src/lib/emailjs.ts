import emailjs from '@emailjs/browser'

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY

export interface EmailData {
  to_email: string
  to_name: string
  magic_link: string
  from_name: string
}

export async function sendMagicLinkEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS configuration missing')
      return false
    }

    const templateParams = {
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      magic_link: emailData.magic_link,
      from_name: emailData.from_name,
    }

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    console.log('EmailJS email sent successfully:', result)
    return true
  } catch (error) {
    console.error('EmailJS error:', error)
    return false
  }
}

// Server-side email sending using nodemailer as fallback
export async function sendMagicLinkEmailServer(emailData: EmailData): Promise<boolean> {
  try {
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailData.to_email,
      subject: 'Connexion à HelvetiForma',
      html: `
        <h2>Connexion à HelvetiForma</h2>
        <p>Bonjour ${emailData.to_name},</p>
        <p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
        <a href="${emailData.magic_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Se connecter</a>
        <p>Ce lien expire dans 24 heures.</p>
        <p>Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Magic link email sent via server')
    return true
  } catch (error) {
    console.error('Server email error:', error)
    return false
  }
}
