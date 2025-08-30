// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
};

// EmailJS Template Variables
export const emailjsTemplateParams = {
  to_name: 'Helvetiforma Team',
  from_name: '', // Will be filled by form data
  from_email: '', // Will be filled by form data
  subject: '', // Will be filled by form data
  message: '', // Will be filled by form data
};
