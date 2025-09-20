# Vercel Deployment - Environment Variables

This guide lists all the environment variables you need to set in your Vercel dashboard for deployment.

## Required Environment Variables

### 1. WordPress Configuration
```env
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_LICENSE_KEY=your_tutor_license_key_here
TUTOR_CLIENT_ID=your_tutor_client_id_here
TUTOR_SECRET_KEY=your_tutor_secret_key_here
WORDPRESS_APP_PASSWORD=your_wordpress_app_password_here
```

### 2. WooCommerce API Credentials
```env
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Stripe API Credentials
```env
# Test keys (for development/staging)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Live keys (for production)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key_here
```

### 4. Stripe Domain IDs (NEW - for payment method verification)
```env
# Main website domain for Apple Pay, Google Pay, etc.
STRIPE_MAIN_DOMAIN_ID=pmd_1S99tXLajjczdCNE7TnUhyRK

# API domain for webhooks
STRIPE_API_DOMAIN_ID=pmd_1S99qFLajjczdCNEDSutOBaV
```

### 5. Application Settings
```env
DEFAULT_COURSE_ID=24
NODE_ENV=production
```

## How to Set Environment Variables in Vercel

1. **Go to your Vercel dashboard**
2. **Select your project** (helvetiforma)
3. **Go to Settings > Environment Variables**
4. **Add each variable** with the appropriate value
5. **Set the environment** (Production, Preview, or Development)

## Environment-Specific Settings

### Development
- Use test Stripe keys
- Use development WordPress URL
- Set `NODE_ENV=development`

### Production
- Use live Stripe keys
- Use production WordPress URL
- Set `NODE_ENV=production`

## Stripe Domain IDs Usage

These domain IDs are used for:
- **Apple Pay verification**: `STRIPE_MAIN_DOMAIN_ID`
- **Google Pay verification**: `STRIPE_MAIN_DOMAIN_ID`
- **Webhook verification**: `STRIPE_API_DOMAIN_ID`
- **Payment method validation**: Both domains

## Security Notes

- **Never commit** `.env.local` to version control
- **Use Vercel's environment variables** for production secrets
- **Rotate keys regularly** for security
- **Use different keys** for test and live environments

## Verification Checklist

After deployment, verify:
- [ ] Stripe payments work without warnings
- [ ] Apple Pay appears in PaymentElement
- [ ] Google Pay appears in PaymentElement
- [ ] Webhooks are received correctly
- [ ] No console errors related to domain verification

## Troubleshooting

If you see domain verification warnings:
1. Check that `STRIPE_MAIN_DOMAIN_ID` is set correctly
2. Verify the domain is active in Stripe dashboard
3. Ensure the domain matches your production URL
4. Check that Apple Pay domain verification is complete
