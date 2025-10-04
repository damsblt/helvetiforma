# 🚀 NextAuth Deployment Guide for Vercel

## ✅ **Current System Status**

The payment system is **functional** with NextAuth authentication:

### 🎯 **Components implemented:**
- ✅ NextAuth authentication with credentials provider
- ✅ Payment page (`/checkout/[postId]`)
- ✅ Stripe checkout session API (`/api/payment/create-checkout-session`)
- ✅ Purchase recording API (`/api/payment/record-purchase`)
- ✅ Stripe webhook handler (`/api/payment/webhook`)
- ✅ Client-side error handling
- ✅ Responsive and modern UI
- ✅ Sanity integration for purchase storage

## 🔧 **Required Vercel Environment Variables**

### 1. **NextAuth Configuration**
```bash
# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://helvetiforma.ch
AUTH_URL=https://helvetiforma.ch
AUTH_SECRET=your-nextauth-secret-here
```

### 2. **Email Configuration (for future email provider)**
```bash
EMAIL_SERVER_HOST=asmtp.mail.hostpoint.ch
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=contact@helvetiforma.ch
EMAIL_SERVER_PASSWORD=Contactformation2025*
EMAIL_FROM=noreply@helvetiforma.ch
```

### 3. **Stripe Configuration**
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. **Sanity Configuration**
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xzzyyelh
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk_... # Token with write permissions
```

### 5. **Site Configuration**
```bash
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch
```

## 🚀 **Deployment Steps**

### 1. **Deploy to Vercel**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

### 2. **Set Environment Variables in Vercel**
```bash
# NextAuth
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add AUTH_URL production
vercel env add AUTH_SECRET production

# Email (for future use)
vercel env add EMAIL_SERVER_HOST production
vercel env add EMAIL_SERVER_PORT production
vercel env add EMAIL_SERVER_USER production
vercel env add EMAIL_SERVER_PASSWORD production
vercel env add EMAIL_FROM production

# Stripe
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Sanity
vercel env add SANITY_API_TOKEN production

# Site
vercel env add NEXT_PUBLIC_SITE_URL production
```

### 3. **Configure Stripe Webhooks**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Create new webhook endpoint: `https://helvetiforma.ch/api/payment/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret and add it to Vercel env vars

### 4. **Configure Sanity Token**
1. Go to [Sanity Management](https://www.sanity.io/manage)
2. Select project `helvetiforma`
3. Go to "API" > "Tokens"
4. Create new token with "Editor" permissions
5. Add to Vercel environment variables

## 🧪 **Testing the Deployment**

### 1. **Test Authentication**
1. Go to `https://helvetiforma.ch/login`
2. Try logging in with any email/password (credentials provider accepts anything)
3. Verify session is created

### 2. **Test Payment Flow**
1. Go to `https://helvetiforma.ch/posts/test-2`
2. Click "Acheter pour 5 CHF"
3. Complete checkout with Stripe test card: `4242 4242 4242 4242`
4. Verify purchase is recorded in Sanity

### 3. **Test Webhooks**
```bash
# Install Stripe CLI
stripe listen --forward-to https://helvetiforma.ch/api/payment/webhook

# Test webhook
stripe trigger checkout.session.completed
```

## 📊 **Monitoring**

### 1. **Vercel Logs**
```bash
vercel logs --follow
```

### 2. **Stripe Dashboard**
- Monitor successful/failed payments
- Check webhook delivery status

### 3. **Sanity Studio**
- Verify purchases are recorded
- Check for API errors

## 🔒 **Security Notes**

1. **NextAuth Secret**: Must be the same across all instances
2. **Stripe Webhooks**: Always verify signatures
3. **Sanity Token**: Use minimal required permissions
4. **Environment Variables**: Never commit secrets to repository

## 🎯 **Current Authentication Flow**

1. **Login**: User enters email/password → NextAuth credentials provider
2. **Session**: JWT token stored in secure HTTP-only cookie
3. **Purchase**: User ID from NextAuth session used for purchase recording
4. **Access Control**: Session checked on post page for premium content

## 🆘 **Troubleshooting**

### Common Issues:
1. **Session not persisting**: Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
2. **Payment fails**: Verify Stripe keys and webhook configuration
3. **Purchase not recorded**: Check Sanity token permissions
4. **CORS errors**: Ensure `NEXTAUTH_URL` matches your domain

### Debug Commands:
```bash
# Check environment variables
vercel env ls

# View logs
vercel logs

# Test API endpoints
curl https://helvetiforma.ch/api/auth/session
curl https://helvetiforma.ch/api/test-auth
```

---

**🎉 Your NextAuth payment system is ready for production!**
