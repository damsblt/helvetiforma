#!/bin/bash

echo "Setting up Hostpoint email configuration in Vercel..."

# Add SMTP configuration for Hostpoint
echo "asmtp.mail.hostpoint.ch" | vercel env add SMTP_HOST production
echo "465" | vercel env add SMTP_PORT production  
echo "true" | vercel env add SMTP_SECURE production
echo "contact@helvetiforma.ch" | vercel env add SMTP_USER production
echo "contact@helvetiforma.ch" | vercel env add SMTP_FROM production

echo ""
echo "✅ Environment variables added to Vercel!"
echo ""
echo "⚠️  IMPORTANT: You still need to set SMTP_PASS manually:"
echo "   vercel env add SMTP_PASS production"
echo "   Then enter your actual email password when prompted."
echo ""
echo "To verify your environment variables:"
echo "   vercel env ls"
