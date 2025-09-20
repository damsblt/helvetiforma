# WooCommerce + TutorLMS Webhook Setup Guide

## 🚨 Current Issue
The webhooks between WooCommerce and TutorLMS are **broken or disabled**. Here's how to fix them:

## 🔧 Step 1: Enable Webhooks in WordPress Admin

### A. WooCommerce Webhook Configuration
1. **Go to**: WordPress Admin → WooCommerce → Settings → Advanced → Webhooks
2. **Create new webhook**:
   - **Name**: `Order Completed - Course Enrollment`
   - **Status**: `Active`
   - **Topic**: `Order updated`
   - **Secret**: `your-secret-key-here` (generate a strong secret)
   - **Delivery URL**: `https://your-domain.com/api/webhooks/woocommerce/order-completed`
   - **API Version**: `WooCommerce API v3`

### B. TutorLMS Webhook Configuration
1. **Go to**: WordPress Admin → Tutor LMS → Settings → Advanced
2. **Enable webhooks** for course creation/updates
3. **Set webhook URL**: `https://your-domain.com/api/webhooks/tutor-course-created`

## 🔧 Step 2: Fix Webhook Endpoints

### A. Enable TutorLMS Webhook
The TutorLMS webhook is currently disabled. Let's fix it:

```typescript
// In src/app/api/webhooks/tutor-course-created/route.ts
// Remove lines 12-15 that disable the webhook
```

### B. Test Webhook Connectivity
Create a test endpoint to verify webhooks are working:

```typescript
// New file: src/app/api/webhooks/test/route.ts
```

## 🔧 Step 3: Local Development Setup

### A. Use ngrok for Local Testing
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3002

# Use the ngrok URL for webhooks
# Example: https://abc123.ngrok.io/api/webhooks/woocommerce/order-completed
```

### B. Update Environment Variables
```bash
# Add to .env.local
WEBHOOK_SECRET=your-webhook-secret-key
NGROK_URL=https://your-ngrok-url.ngrok.io
```

## 🔧 Step 4: Test Webhook Functionality

### A. Test WooCommerce Webhook
```bash
# Test the webhook endpoint
curl -X POST http://localhost:3002/api/webhooks/woocommerce/order-completed \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123,
    "status": "completed",
    "billing": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User"
    },
    "line_items": [
      {
        "product_id": 1,
        "quantity": 1
      }
    ]
  }'
```

### B. Test TutorLMS Webhook
```bash
# Test the webhook endpoint
curl -X POST http://localhost:3002/api/webhooks/tutor-course-created \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 24,
    "action": "created"
  }'
```

## 🔧 Step 5: Production Setup

### A. SSL Certificate Required
- Webhooks require HTTPS in production
- Ensure your domain has a valid SSL certificate

### B. Webhook Security
- Implement proper signature verification
- Use strong webhook secrets
- Rate limiting for webhook endpoints

## 🔧 Step 6: Debugging Webhooks

### A. Enable Logging
```typescript
// Add comprehensive logging to webhook endpoints
console.log('Webhook received:', {
  timestamp: new Date().toISOString(),
  headers: Object.fromEntries(request.headers.entries()),
  body: await request.json()
});
```

### B. Monitor Webhook Calls
- Check server logs for webhook calls
- Use webhook testing tools (webhook.site)
- Monitor failed webhook deliveries

## 🚀 Quick Fix Implementation

1. **Enable TutorLMS webhook** (remove disabled code)
2. **Set up ngrok** for local testing
3. **Configure WooCommerce webhooks** in WordPress admin
4. **Test the complete flow**

## 📋 Testing Checklist

- [ ] WooCommerce webhook configured
- [ ] TutorLMS webhook enabled
- [ ] ngrok tunnel active
- [ ] Webhook URLs accessible
- [ ] Test order creation
- [ ] Verify course enrollment
- [ ] Check error logs

## 🔍 Common Issues

1. **Webhook not firing**: Check WordPress webhook configuration
2. **CORS errors**: Add proper CORS headers
3. **SSL issues**: Use ngrok or valid SSL certificate
4. **Authentication errors**: Verify API credentials
5. **Timeout errors**: Increase webhook timeout settings

This setup will restore the webhook functionality between WooCommerce and TutorLMS.
