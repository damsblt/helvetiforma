# Stripe Setup Guide for HelvetiForma

This guide addresses the Stripe.js warnings and configuration issues you're experiencing.

## Issues Fixed

### ✅ 1. HTTPS Warning
- **Issue**: "You may test your Stripe.js integration over HTTP. However, live Stripe.js integrations must use HTTPS."
- **Status**: This is normal for development. Will be resolved when deployed to production with HTTPS.
- **Action**: No action needed for development. Ensure production deployment uses HTTPS.

### ✅ 2. Image Preload Warning
- **Issue**: "The resource http://localhost:3000/images/hero-bg.jpg was preloaded using link preload but not used within a few seconds"
- **Status**: Fixed by making image preload conditional (only on homepage)
- **Action**: Completed in layout.tsx

### 🔄 3. Twint Payment Method Warning
- **Issue**: "The following payment method types are not activated: - twint"
- **Status**: Partially fixed by removing Twint from payment methods
- **Action**: Twint removed from payment method types in create-payment-intent route

### 🔄 4. Apple Pay Domain Registration
- **Issue**: "You have not registered or verified the domain, so the following payment methods are not enabled in the Payment Element: - apple_pay"
- **Status**: Requires Stripe dashboard configuration
- **Action**: See instructions below

## Required Actions in Stripe Dashboard

### 1. Activate Payment Methods
1. Go to [Stripe Dashboard > Settings > Payment methods](https://dashboard.stripe.com/settings/payment_methods)
2. Activate the following payment methods for Switzerland:
   - **Card payments** (already active)
   - **Klarna** (for Swiss customers)
   - **Sofort** (for German-speaking customers)
   - **Bancontact** (for Belgian customers)
   - **EPS** (for Austrian customers)
   - **Giropay** (for German customers)
   - **iDEAL** (for Dutch customers)
   - **P24** (for Polish customers)
   - **SEPA Direct Debit** (for EU customers)

### 2. Register Domain for Apple Pay
1. Go to [Stripe Dashboard > Settings > Payment methods > Apple Pay](https://dashboard.stripe.com/settings/payment_methods/apple_pay)
2. Click "Add domain"
3. Add your production domain: `helvetiforma.ch`
4. Follow the domain verification process (download verification file and upload to your domain)

### 3. Configure Webhooks (Optional but Recommended)
1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://helvetiforma.ch/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

## Current Payment Method Configuration

The system now uses these payment methods (configured in `create-payment-intent` route):
- Card payments (Visa, Mastercard, American Express)
- Klarna (Swiss customers)
- Sofort (German-speaking customers)
- Bancontact (Belgian customers)
- EPS (Austrian customers)
- Giropay (German customers)
- iDEAL (Dutch customers)
- P24 (Polish customers)
- SEPA Direct Debit (EU customers)

## Testing

### Test Mode
- All warnings are normal in test mode
- Use Stripe test cards: `4242 4242 4242 4242`
- Test with different payment methods to ensure they work

### Live Mode
- Ensure HTTPS is enabled
- Register domain for Apple Pay
- Activate required payment methods
- Test with real payment methods

## Environment Variables

Make sure these are set in your `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

For production, use live keys:
```env
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key_here
```

## Next Steps

1. ✅ Image preload issue fixed
2. ✅ Payment method configuration updated
3. 🔄 Activate payment methods in Stripe dashboard
4. 🔄 Register domain for Apple Pay
5. 🔄 Test payment flow with different methods
6. 🔄 Deploy to production with HTTPS

## Support

If you encounter issues:
1. Check Stripe dashboard for payment method status
2. Verify domain registration for Apple Pay
3. Test with different payment methods
4. Check browser console for any remaining warnings
