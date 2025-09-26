import { NextRequest, NextResponse } from 'next/server';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailData = await request.json();
    
    // For now, we'll just log the email data
    // In production, you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log('Email to send:', {
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    });

    // TODO: Integrate with actual email service
    // For now, we'll simulate success
    // You can replace this with actual email service integration
    
    // Example with SendGrid (uncomment and configure):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: emailData.to,
      from: 'noreply@helvetiforma.ch',
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    };
    
    await sgMail.send(msg);
    */

    // Example with Mailgun (uncomment and configure):
    /*
    const formData = new FormData();
    formData.append('from', 'noreply@helvetiforma.ch');
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('text', emailData.text);
    formData.append('html', emailData.html);

    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully (simulated)' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send email' 
    }, { status: 500 });
  }
}
