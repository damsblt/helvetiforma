# Email SSL/TLS Configuration Troubleshooting Guide

## Problem
You're encountering this SSL error:
```
412SMTP: A0E34EA6FFFF0000:error:0A00010B:SSL routines:ssl3_get_record:wrong version number:../deps/openssl/openssl/ssl/record/ssl3_record.c:354:
```

## Root Cause
This error occurs when there's a mismatch between the SSL/TLS configuration and the email server's expected protocol. The most common causes are:

1. **Port and Security Mismatch**: Using SSL on a port that expects STARTTLS, or vice versa
2. **Inconsistent Configuration**: Different email services using different SSL settings
3. **Wrong Port for Protocol**: Using port 465 with `secure: false` or port 587 with `secure: true`

## Solution Applied

I've standardized your email configuration across all services to properly handle SSL/TLS:

### Key Changes Made:

1. **Dynamic SSL Configuration**: 
   - `secure: port === 465` (true for port 465, false for others)
   - `requireTLS: port !== 465` (requireTLS for non-SSL ports)

2. **Consistent Port Handling**:
   - Port 465: Uses SSL/TLS directly
   - Port 587: Uses STARTTLS (upgrades connection to TLS)

3. **Updated Files**:
   - `src/lib/emailjs.ts`
   - `src/lib/custom-email-provider.ts`
   - `src/app/api/contact/route.ts`
   - `src/app/api/test-email-connection/route.ts`

## Environment Variables Required

Make sure you have these environment variables set correctly:

```env
EMAIL_SERVER_HOST=your-smtp-host.com
EMAIL_SERVER_PORT=587  # or 465 for SSL
EMAIL_SERVER_USER=your-email@domain.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@domain.com
```

## Common Email Provider Settings

### Gmail
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
# Use App Password, not regular password
```

### Outlook/Hotmail
```env
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
```

### Custom SMTP (SSL)
```env
EMAIL_SERVER_HOST=your-smtp-server.com
EMAIL_SERVER_PORT=465
```

### Custom SMTP (STARTTLS)
```env
EMAIL_SERVER_HOST=your-smtp-server.com
EMAIL_SERVER_PORT=587
```

## Testing Your Configuration

1. **Test Email Connection**:
   ```bash
   curl http://localhost:3000/api/test-email-connection
   ```

2. **Test Contact Form**:
   - Go to your contact page
   - Submit a test message
   - Check server logs for errors

3. **Test Magic Link**:
   - Try to log in with email
   - Check if magic link email is sent

## Troubleshooting Steps

1. **Check Your Email Provider Settings**:
   - Verify the correct SMTP host and port
   - Ensure you're using the right authentication method
   - For Gmail, use App Passwords, not regular passwords

2. **Verify Environment Variables**:
   - Make sure all required variables are set
   - Check for typos in variable names
   - Ensure no extra spaces or quotes

3. **Test with Different Ports**:
   - Try port 587 with STARTTLS
   - Try port 465 with SSL
   - Check your email provider's documentation

4. **Check Firewall/Network**:
   - Ensure your hosting provider allows outbound SMTP connections
   - Check if ports 587 and 465 are accessible

## Common Issues and Solutions

### Issue: "wrong version number" error
**Solution**: This usually means you're using SSL on a port that expects STARTTLS. Use port 587 with `secure: false` and `requireTLS: true`.

### Issue: "Connection timeout"
**Solution**: Check your SMTP host and port. Some providers use different ports.

### Issue: "Authentication failed"
**Solution**: 
- For Gmail: Use App Passwords instead of regular passwords
- For other providers: Check if 2FA is enabled and use app-specific passwords

### Issue: "Connection refused"
**Solution**: Check if your hosting provider blocks SMTP ports. You may need to use a different port or contact support.

## Next Steps

1. Update your environment variables with the correct settings
2. Test the email connection using the test endpoint
3. Try sending a test email through the contact form
4. If issues persist, check your email provider's specific requirements

The configuration is now standardized and should work with most email providers. The key is ensuring your environment variables match your email provider's requirements.
