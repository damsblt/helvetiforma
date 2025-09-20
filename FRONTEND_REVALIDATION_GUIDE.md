# 🔄 Frontend Revalidation System

## Overview
This system automatically updates the Next.js frontend when courses are modified in WooCommerce/TutorLMS, ensuring users always see the latest course information without manual cache clearing.

## 🚀 How It Works

### 1. Webhook Triggers
When a course is updated in TutorLMS, the webhook automatically:
- Updates the corresponding WooCommerce product
- Triggers frontend revalidation for affected pages
- Invalidates cached data

### 2. Revalidation Methods
The system uses multiple revalidation strategies:

#### Path-based Revalidation
- `/courses` - Course listing page
- `/courses/[id]` - Individual course pages
- `/formations` - Formations page
- `/elearning` - E-learning page
- `/student-dashboard` - Student dashboard

#### Tag-based Revalidation
- `courses` - All course-related data
- `woocommerce-products` - WooCommerce product data

### 3. Caching Strategy
- **ISR (Incremental Static Regeneration)**: Pages are cached and revalidated on-demand
- **Cache Duration**: 1 hour (3600 seconds) for course data
- **Automatic Invalidation**: Triggered by webhooks

## 🔧 Configuration

### Environment Variables
Add to your `.env.local` file:

```env
# Frontend Revalidation
REVALIDATE_SECRET=your-revalidation-secret-key-here

# Site URL for webhook calls
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercel Configuration
In Vercel dashboard, add these environment variables:
- `REVALIDATE_SECRET`: A secure random string
- `NEXT_PUBLIC_SITE_URL`: Your production domain

## 📁 Files Modified

### 1. Webhook Endpoints
- `src/app/api/webhooks/tutor-course-updated/route.ts`
- `src/app/api/webhooks/tutor-course-created/route.ts`
- `src/app/api/webhooks/woocommerce/order-completed/route.ts`

### 2. Revalidation API
- `src/app/api/revalidate/route.ts` - New revalidation endpoint

### 3. Cached API Routes
- `src/app/api/woocommerce/courses-with-content/route.ts` - Added caching with tags

## 🧪 Testing

### 1. Test Revalidation Endpoint
```bash
# Test the revalidation endpoint
curl -X POST "http://localhost:3000/api/revalidate?path=/courses&secret=your-secret-key"

# Test with tags
curl -X POST "http://localhost:3000/api/revalidate?tag=courses&secret=your-secret-key"
```

### 2. Test Webhook Flow
1. Update a course in TutorLMS
2. Check webhook logs for revalidation calls
3. Verify frontend shows updated course data

### 3. Manual Revalidation
```bash
# Revalidate all course pages
curl -X POST "http://localhost:3000/api/revalidate?path=/courses&secret=your-secret-key"

# Revalidate specific course
curl -X POST "http://localhost:3000/api/revalidate?path=/courses/123&secret=your-secret-key"

# Revalidate by tag
curl -X POST "http://localhost:3000/api/revalidate?tag=courses&secret=your-secret-key"
```

## 🔍 Monitoring

### 1. Webhook Logs
Check server logs for revalidation calls:
```bash
# Look for these log messages
"Frontend revalidation triggered for course: 123"
"Revalidated path: /courses"
"Revalidated tag: courses"
```

### 2. Error Handling
- Revalidation failures don't break webhooks
- Errors are logged but don't affect course updates
- Failed revalidations can be retried manually

## 🚨 Troubleshooting

### Common Issues

#### 1. Revalidation Not Working
- Check `REVALIDATE_SECRET` environment variable
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Check webhook logs for errors

#### 2. Cache Not Updating
- Ensure webhooks are properly configured
- Check if revalidation calls are being made
- Try manual revalidation

#### 3. Webhook Failures
- Verify webhook URLs are accessible
- Check authentication credentials
- Monitor webhook delivery status

### Debug Commands
```bash
# Check revalidation endpoint
curl -X GET "http://localhost:3000/api/revalidate?secret=your-secret-key"

# Test webhook manually
curl -X POST "http://localhost:3000/api/webhooks/tutor-course-updated?course_id=123"
```

## 🔒 Security

### 1. Secret Protection
- Use a strong, random `REVALIDATE_SECRET`
- Never commit secrets to version control
- Rotate secrets regularly

### 2. Webhook Security
- Verify webhook signatures in production
- Use HTTPS for all webhook URLs
- Implement rate limiting

## 📈 Performance

### 1. Caching Benefits
- Reduced API calls to WooCommerce
- Faster page loads
- Better user experience

### 2. Revalidation Strategy
- Only revalidate when necessary
- Use tags for granular control
- Batch revalidation calls

## 🎯 Best Practices

1. **Monitor Revalidation**: Keep track of revalidation success/failure rates
2. **Test Thoroughly**: Test webhook flow in staging environment
3. **Backup Strategy**: Have manual revalidation as fallback
4. **Documentation**: Keep webhook URLs and secrets documented
5. **Error Handling**: Implement proper error handling and logging

## 🔄 Workflow

1. **Course Updated** in TutorLMS
2. **Webhook Triggered** to Next.js app
3. **WooCommerce Product Updated** with new course data
4. **Frontend Revalidation Triggered** for affected pages
5. **Cache Invalidated** and pages regenerated
6. **Users See Updated Content** immediately

This system ensures your frontend always displays the latest course information without manual intervention.
