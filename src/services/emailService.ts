interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface WordPressAccountData {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  passwordResetLink?: string;
  loginUrl: string;
  resetPasswordUrl: string;
  courseNames: string[];
}

export class EmailService {
  private static instance: EmailService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch';
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send WordPress account creation email with login instructions
   */
  async sendWordPressAccountCreated(data: WordPressAccountData): Promise<boolean> {
    try {
      const emailTemplate = this.createWordPressAccountEmail(data);
      
      // For now, we'll use a simple fetch to a webhook or email service
      // In production, you might want to use SendGrid, Mailgun, or similar
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailTemplate),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending WordPress account email:', error);
      return false;
    }
  }

  /**
   * Create email template for WordPress account creation
   */
  private createWordPressAccountEmail(data: WordPressAccountData): EmailTemplate {
    const { email, firstName, lastName, username, passwordResetLink, loginUrl, resetPasswordUrl, courseNames } = data;
    
    const subject = `Bienvenue sur HelvetiForma - Votre compte a été créé !`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur HelvetiForma</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .button:hover { background: #1d4ed8; }
          .course-list { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur HelvetiForma !</h1>
            <p>Votre compte a été créé avec succès</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${firstName} ${lastName},</h2>
            
            <p>Félicitations ! Votre compte HelvetiForma a été créé avec succès. Vous pouvez maintenant accéder à vos formations et commencer votre apprentissage.</p>
            
            <h3>📚 Vos formations :</h3>
            <div class="course-list">
              ${courseNames.map(course => `<p>• ${course}</p>`).join('')}
            </div>
            
            <h3>🔐 Première connexion :</h3>
            ${username ? `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
              <p><strong>Nom d'utilisateur :</strong> ${username}</p>
              <p><strong>Email :</strong> ${email}</p>
            </div>
            
            <p><strong>Pour votre première connexion, définissez votre mot de passe :</strong></p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${passwordResetLink || resetPasswordUrl}" class="button">Définir mon mot de passe</a>
            </div>
            
            <p><strong>Une fois votre mot de passe défini, vous pourrez vous connecter :</strong></p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Se connecter</a>
            </div>
            ` : `
            <p>Pour votre première connexion, vous devrez définir votre mot de passe :</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${passwordResetLink || resetPasswordUrl}" class="button">Définir mon mot de passe</a>
            </div>
            
            <p><strong>Ou connectez-vous directement :</strong></p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Se connecter</a>
            </div>
            `}
            
            <h3>📧 Informations importantes :</h3>
            <ul>
              <li><strong>Email :</strong> ${email}</li>
              <li><strong>URL de connexion :</strong> <a href="${loginUrl}">${loginUrl}</a></li>
              <li><strong>Support :</strong> <a href="mailto:support@helvetiforma.ch">support@helvetiforma.ch</a></li>
            </ul>
            
            <div class="footer">
              <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@helvetiforma.ch">support@helvetiforma.ch</a></p>
              <p>© 2025 HelvetiForma. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bienvenue sur HelvetiForma !

Bonjour ${firstName} ${lastName},

Félicitations ! Votre compte HelvetiForma a été créé avec succès.

Vos formations :
${courseNames.map(course => `• ${course}`).join('\n')}

${username ? `
Vos identifiants de connexion :
- Nom d'utilisateur : ${username}
- Email : ${email}

Pour votre première connexion, définissez votre mot de passe :
${passwordResetLink || resetPasswordUrl}

Une fois votre mot de passe défini, vous pourrez vous connecter :
${loginUrl}
` : `
Première connexion :
Pour votre première connexion, vous devrez définir votre mot de passe en cliquant sur ce lien :
${passwordResetLink || resetPasswordUrl}

Ou connectez-vous directement :
${loginUrl}
`}

Informations importantes :
- Email : ${email}
- URL de connexion : ${loginUrl}
- Support : support@helvetiforma.ch

Si vous avez des questions, contactez-nous à support@helvetiforma.ch

© 2025 HelvetiForma. Tous droits réservés.
    `;

    return {
      to: email,
      subject,
      html,
      text
    };
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(data: {
    email: string;
    firstName: string;
    lastName: string;
    paymentIntent: string;
    amount: number;
    courseNames: string[];
  }): Promise<boolean> {
    try {
      const emailTemplate = this.createPaymentConfirmationEmail(data);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailTemplate),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return false;
    }
  }

  /**
   * Create payment confirmation email template
   */
  private createPaymentConfirmationEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
    paymentIntent: string;
    amount: number;
    courseNames: string[];
  }): EmailTemplate {
    const { email, firstName, lastName, paymentIntent, amount, courseNames } = data;
    
    const subject = `Confirmation de paiement - HelvetiForma`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de paiement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .payment-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Paiement confirmé !</h1>
            <p>Votre commande a été traitée avec succès</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${firstName} ${lastName},</h2>
            
            <p>Votre paiement a été traité avec succès. Vous recevrez bientôt un email avec vos identifiants de connexion.</p>
            
            <div class="payment-details">
              <h3>Détails du paiement :</h3>
              <p><strong>Montant :</strong> CHF ${amount.toFixed(2)}</p>
              <p><strong>Transaction ID :</strong> ${paymentIntent}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            
            <h3>Formations achetées :</h3>
            <ul>
              ${courseNames.map(course => `<li>${course}</li>`).join('')}
            </ul>
            
            <div class="footer">
              <p>Merci pour votre confiance !</p>
              <p>L'équipe HelvetiForma</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Confirmation de paiement - HelvetiForma

Bonjour ${firstName} ${lastName},

Votre paiement a été traité avec succès.

Détails du paiement :
- Montant : CHF ${amount.toFixed(2)}
- Transaction ID : ${paymentIntent}
- Date : ${new Date().toLocaleString('fr-FR')}

Formations achetées :
${courseNames.map(course => `• ${course}`).join('\n')}

Merci pour votre confiance !
L'équipe HelvetiForma
    `;

    return {
      to: email,
      subject,
      html,
      text
    };
  }
}

export const emailService = EmailService.getInstance();
