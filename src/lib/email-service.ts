import nodemailer from 'nodemailer'

// Email configuration using the provided variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'asmtp.mail.hostpoint.ch',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'contact@helvetiforma.ch',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'Contactformation2025*',
  },
})

export interface RegistrationConfirmationData {
  userEmail: string
  userName: string
  registrationDate: Date
  loginUrl?: string
}

export async function sendRegistrationConfirmation(data: RegistrationConfirmationData): Promise<boolean> {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">
            🎉 Bienvenue chez HelvetiForma !
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
            Votre inscription a été confirmée
          </div>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 15px;">
              Félicitations ${data.userName} !
            </div>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Votre compte HelvetiForma a été créé avec succès. Vous pouvez maintenant accéder à toutes nos formations et ressources.
            </p>
          </div>

          <!-- Account Info -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
              📋 Informations de votre compte
            </h3>
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; align-items: center;">
                <div style="background: #e5e7eb; color: #374151; padding: 6px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 12px; min-width: 60px; text-align: center;">
                  EMAIL
                </div>
                <div style="color: #1f2937; font-weight: 500;">
                  ${data.userEmail}
                </div>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="background: #e5e7eb; color: #374151; padding: 6px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 12px; min-width: 60px; text-align: center;">
                  DATE
                </div>
                <div style="color: #1f2937; font-weight: 500;">
                  ${data.registrationDate.toLocaleDateString('fr-FR', { 
                    timeZone: 'Europe/Zurich',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #065f46; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
              🚀 Prochaines étapes
            </h3>
            <div style="space-y: 12px;">
              <div style="display: flex; align-items: start; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; margin-top: 2px;">
                  1
                </div>
                <div>
                  <p style="font-weight: 600; color: #065f46; margin: 0 0 4px 0;">Connectez-vous à votre compte</p>
                  <p style="color: #047857; font-size: 14px; margin: 0;">Accédez à votre espace personnel</p>
                </div>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; margin-top: 2px;">
                  2
                </div>
                <div>
                  <p style="font-weight: 600; color: #065f46; margin: 0 0 4px 0;">Explorez nos formations</p>
                  <p style="color: #047857; font-size: 14px; margin: 0;">Découvrez nos cours et webinaires</p>
                </div>
              </div>
              <div style="display: flex; align-items: start;">
                <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; margin-top: 2px;">
                  3
                </div>
                <div>
                  <p style="font-weight: 600; color: #065f46; margin: 0 0 4px 0;">Participez aux sessions</p>
                  <p style="color: #047857; font-size: 14px; margin: 0;">Inscrivez-vous aux prochains événements</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.loginUrl || 'https://helvetiforma.ch/login'}" 
               style="
                 background: #3b82f6;
                 color: white;
                 padding: 14px 28px;
                 text-decoration: none;
                 border-radius: 8px;
                 font-weight: bold;
                 display: inline-block;
                 font-size: 16px;
               ">
              🔐 Accéder à mon compte
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background: #f9fafb;
          padding: 20px;
          border: 1px solid #e1e5e9;
          border-top: none;
          border-radius: 0 0 8px 8px;
          text-align: center;
          color: #6b7280;
          font-size: 13px;
        ">
          <div style="margin-bottom: 10px;">
            <strong>HelvetiForma</strong> - Formation Professionnelle en Suisse
          </div>
          <div style="color: #9ca3af; font-size: 12px;">
            Cet email a été envoyé automatiquement suite à votre inscription sur <strong>helvetiforma.ch</strong><br>
            <span style="color: #d1d5db;">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Zurich' })}</span>
          </div>
        </div>
      </div>
    `

    const textContent = `
Bienvenue chez HelvetiForma !

Félicitations ${data.userName} !

Votre compte HelvetiForma a été créé avec succès.

Informations de votre compte:
- Email: ${data.userEmail}
- Date d'inscription: ${data.registrationDate.toLocaleString('fr-FR', { timeZone: 'Europe/Zurich' })}

Prochaines étapes:
1. Connectez-vous à votre compte: ${data.loginUrl || 'https://helvetiforma.ch/login'}
2. Explorez nos formations disponibles
3. Inscrivez-vous aux prochaines sessions

Merci de nous faire confiance pour votre formation professionnelle.

L'équipe HelvetiForma
    `

    const mailOptions = {
      from: `"HelvetiForma" <${process.env.EMAIL_SERVER_USER || 'contact@helvetiforma.ch'}>`,
      to: data.userEmail,
      subject: '🎉 Bienvenue chez HelvetiForma - Inscription confirmée',
      text: textContent,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Registration confirmation email sent to:', data.userEmail)
    return true

  } catch (error) {
    console.error('❌ Error sending registration confirmation email:', error)
    return false
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Email server connection verified')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error)
    return false
  }
}
