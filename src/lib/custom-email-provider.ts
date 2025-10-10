import { sendMagicLinkEmailServer } from './emailjs'

export function CustomEmailProvider() {
  return {
    id: 'email',
    name: 'Email',
    type: 'email',
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
      requireTLS: process.env.EMAIL_SERVER_PORT !== '465', // requireTLS for non-SSL ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
    maxAge: 24 * 60 * 60, // 24 hours
    sendVerificationRequest: async ({
      identifier: email,
      url,
      provider: { server, from },
    }: {
      identifier: string
      url: string
      provider: { server: any; from: string }
    }) => {
      console.log('🔍 Sending magic link email to:', email)
      console.log('🔍 Magic link URL:', url)
      
      try {
        const success = await sendMagicLinkEmailServer({
          to_email: email,
          to_name: email.split('@')[0], // Use email prefix as name
          magic_link: url,
          from_name: 'HelvetiForma',
        })
        
        if (success) {
          console.log('✅ Magic link email sent successfully')
        } else {
          console.error('❌ Failed to send magic link email')
        }
      } catch (error) {
        console.error('❌ Error sending magic link email:', error)
      }
    },
  }
}
