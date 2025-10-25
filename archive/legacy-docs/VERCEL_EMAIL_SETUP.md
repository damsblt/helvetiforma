# Vercel Email Configuration Setup

## Quick Setup Commands

Run these commands in your terminal to add the Hostpoint email configuration to Vercel:

```bash
# Add SMTP Host (Hostpoint server)
vercel env add SMTP_HOST production
# When prompted, enter: asmtp.mail.hostpoint.ch

# Add SMTP Port
vercel env add SMTP_PORT production  
# When prompted, enter: 465

# Add SMTP Security (SSL)
vercel env add SMTP_SECURE production
# When prompted, enter: true

# Add SMTP Username
vercel env add SMTP_USER production
# When prompted, enter: contact@helvetiforma.ch

# Add SMTP From Address
vercel env add SMTP_FROM production
# When prompted, enter: contact@helvetiforma.ch

# Add SMTP Password (IMPORTANT - use your actual email password)
vercel env add SMTP_PASS production
# When prompted, enter: YOUR_ACTUAL_EMAIL_PASSWORD
```

## Values to Enter

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `asmtp.mail.hostpoint.ch` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `contact@helvetiforma.ch` |
| `SMTP_FROM` | `contact@helvetiforma.ch` |
| `SMTP_PASS` | `YOUR_ACTUAL_EMAIL_PASSWORD` |

## Verify Configuration

After adding all variables, verify they're set correctly:

```bash
vercel env ls
```

You should see all the SMTP_* variables listed.

## Deploy

After setting up the environment variables, deploy your changes:

```bash
vercel --prod
```

## Test the Contact Form

1. Go to your live site
2. Navigate to the contact page
3. Fill out and submit the form
4. Check the `contact@helvetiforma.ch` inbox

## Troubleshooting

If emails aren't being sent:

1. **Check Vercel logs**: `vercel logs`
2. **Verify environment variables**: `vercel env ls`
3. **Test with a simple email client** to confirm Hostpoint credentials work
4. **Check spam folder** in your email

## Security Note

The `SMTP_PASS` variable is encrypted in Vercel, so your email password is secure. Never commit this password to your repository.
