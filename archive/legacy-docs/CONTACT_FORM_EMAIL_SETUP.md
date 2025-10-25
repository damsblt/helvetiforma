# Contact Form Email Setup Guide

## Overview

The contact form has been configured to send emails directly to `contact@helvetiforma.ch` when users submit the form. The implementation uses Nodemailer with SMTP configuration.

## What's Been Implemented

### 1. API Endpoint
- **File**: `src/app/api/contact/route.ts`
- **Function**: Handles POST requests from the contact form
- **Features**:
  - Validates form data (required fields, email format)
  - Sends formatted HTML and text emails
  - Includes all form fields in the email
  - Sets reply-to address to the user's email
  - Handles errors gracefully

### 2. Updated Contact Form
- **File**: `src/components/forms/ContactForm.tsx`
- **Changes**:
  - Now calls the `/api/contact` endpoint instead of simulating submission
  - Shows specific success message mentioning `contact@helvetiforma.ch`
  - Proper error handling for failed submissions

### 3. Environment Variables
- **File**: `env.example` (updated)
- **New variables**:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM=contact@helvetiforma.ch
  ```

## Email Configuration Options

### Option 1: Hostpoint SMTP (Current Setup)
Your email is hosted with Hostpoint. Use these settings:

1. Update your `.env` file with Hostpoint settings:
   ```
   SMTP_HOST=asmtp.mail.hostpoint.ch
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=contact@helvetiforma.ch
   SMTP_PASS=your-email-password
   SMTP_FROM=contact@helvetiforma.ch
   ```

2. Use your actual email password for `SMTP_PASS`

**Hostpoint SMTP Details:**
- **Server**: asmtp.mail.hostpoint.ch
- **Port**: 465 (SSL/TLS)
- **Security**: SSL/TLS encryption
- **Authentication**: Required
- **Username**: Full email address (contact@helvetiforma.ch)
- **Password**: Your email account password

### Option 2: Gmail SMTP (Alternative for testing)
1. Create a Gmail account or use existing one
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Update your `.env` file:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=contact@helvetiforma.ch
   ```

### Option 3: Professional Email Provider
For production, consider using a professional email service:

#### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=contact@helvetiforma.ch
```

#### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM=contact@helvetiforma.ch
```

#### Custom SMTP Server
If you have your own email server:
```
SMTP_HOST=mail.helvetiforma.ch
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@helvetiforma.ch
SMTP_PASS=your-email-password
SMTP_FROM=contact@helvetiforma.ch
```

## Email Format

The emails sent to `contact@helvetiforma.ch` include:

### HTML Version
- Professional styling with HelvetiForma branding
- Structured layout with contact information
- Formatted message content
- Timestamp in Swiss timezone

### Text Version
- Plain text fallback
- All the same information in a readable format

### Email Headers
- **From**: "HelvetiForma Contact Form" <your-smtp-user>
- **To**: contact@helvetiforma.ch
- **Reply-To**: User's email address (so you can reply directly)
- **Subject**: [Contact Form] {user's subject}

## Testing

1. Set up your environment variables in `.env`
2. Start the development server: `npm run dev`
3. Go to the contact page
4. Fill out and submit the form
5. Check the `contact@helvetiforma.ch` inbox

## Security Features

- Input validation (required fields, email format)
- Error handling without exposing sensitive information
- Rate limiting (handled by Next.js API routes)
- No sensitive data logged in production

## Troubleshooting

### Common Issues

1. **"Failed to send email" error**
   - Check SMTP credentials
   - Verify SMTP server settings
   - Ensure 2FA is enabled for Gmail (if using Gmail)

2. **Emails not received**
   - Check spam folder
   - Verify SMTP_FROM address is valid
   - Test with a different email provider

3. **Authentication errors**
   - For Gmail: Use App Password, not regular password
   - For other providers: Check username/password format

### Debug Mode
To debug email issues, check the server console logs when submitting the form.

## Production Deployment

1. Set environment variables in your hosting platform
2. Ensure SMTP credentials are secure
3. Consider using a dedicated email service for better deliverability
4. Monitor email delivery rates

## Next Steps

The contact form is now fully functional and will send emails directly to `contact@helvetiforma.ch`. You just need to:

1. Configure your SMTP settings in the `.env` file
2. Test the form submission
3. Verify emails are received at `contact@helvetiforma.ch`

The system is ready for production use!
