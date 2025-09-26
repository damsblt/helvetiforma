// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'helvetiforma',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_zuqqjto',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'xRx0PexeDe91wJ0_p',
};

// EmailJS Template Variables
export const emailjsTemplateParams = {
  to_name: 'HelvetiForma Team',
  from_name: '', // Will be filled by form data
  from_email: '', // Will be filled by form data
  subject: '', // Will be filled by form data
  message: '', // Will be filled by form data
};
