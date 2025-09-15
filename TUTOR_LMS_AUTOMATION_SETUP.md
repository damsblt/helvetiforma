# Tutor LMS Automatic "Apprenant" Assignment Setup

## 🎯 Overview

This system automatically assigns the "Apprenant" role in Tutor LMS when someone registers on your Next.js web app at `/register`. The integration is seamless and requires no manual intervention.

## 🔧 How It Works

1. **User registers** on `helvetiforma.ch/register`
2. **Next.js calls** WordPress API endpoint
3. **WordPress creates** user with "subscriber" role
4. **Tutor LMS integration** automatically assigns "Apprenant" status
5. **User appears** in Tutor LMS learners list
6. **Admin gets notified** via email

## 📋 Prerequisites

### WordPress Requirements
- ✅ WordPress 5.8+
- ✅ Tutor LMS plugin installed and activated
- ✅ HelvetiForma registration plugin installed
- ✅ PHP 7.4+ with cURL enabled

### Next.js Requirements
- ✅ Next.js app deployed
- ✅ WordPress API accessible
- ✅ Environment variables configured

## 🚀 Installation Steps

### 1. Install WordPress Plugin

Upload the `helvetiforma-registration.php` file to your WordPress plugins directory:

```bash
# Upload to WordPress
wp-content/plugins/helvetiforma-registration/helvetiforma-registration.php
```

### 2. Activate the Plugin

1. Go to **WordPress Admin** → **Plugins**
2. Find **"HelvetiForma Public Registration"**
3. Click **"Activate"**

### 3. Configure WordPress Settings

Add these settings to your WordPress `wp-config.php` or use the WordPress admin:

```php
// Add to wp-config.php
define('HELVETIFORMA_NEXTJS_URL', 'https://helvetiforma.ch');
define('HELVETIFORMA_WEBHOOK_SECRET', 'your-secret-key-here');
```

Or set them via WordPress admin:
- Go to **Settings** → **General**
- Add custom options:
  - `helvetiforma_nextjs_url`: `https://helvetiforma.ch`
  - `helvetiforma_webhook_secret`: `your-secret-key-here`

### 4. Configure Next.js Environment

Add to your `.env.local`:

```env
# WordPress API Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_WEBHOOK_SECRET=your-secret-key-here
```

### 5. Test the Integration

1. **Register a test user** on `helvetiforma.ch/register`
2. **Check WordPress** → **Users** → Should see new user with "Subscriber" role
3. **Check Tutor LMS** → **Students** → Should see new "Apprenant"
4. **Check email** → Admin should receive notification

## 🔍 Verification Steps

### Check WordPress User Creation
```sql
-- Run in WordPress database
SELECT ID, user_login, user_email, user_registered 
FROM wp_users 
WHERE user_email = 'test@example.com';
```

### Check User Meta for Tutor LMS
```sql
-- Check Tutor LMS specific meta
SELECT user_id, meta_key, meta_value 
FROM wp_usermeta 
WHERE user_id = [USER_ID] 
AND meta_key LIKE 'tutor_%';
```

### Check User Roles
```sql
-- Check user roles
SELECT u.ID, u.user_login, um.meta_value as capabilities
FROM wp_users u
JOIN wp_usermeta um ON u.ID = um.user_id
WHERE um.meta_key = 'wp_capabilities'
AND u.user_email = 'test@example.com';
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. User Not Appearing in Tutor LMS
**Symptoms**: User created in WordPress but not visible in Tutor LMS students list

**Solutions**:
- Check if Tutor LMS is active: `class_exists('TUTOR\Tutor')`
- Verify user has `subscriber` role
- Check user meta: `_is_tutor_student` should be `yes`
- Clear Tutor LMS cache

#### 2. Registration API Not Working
**Symptoms**: Next.js registration form shows error

**Solutions**:
- Check WordPress REST API is enabled
- Verify plugin is activated
- Check WordPress error logs
- Test API endpoint directly: `POST /wp-json/helvetiforma/v1/register`

#### 3. Webhook Not Sending
**Symptoms**: No webhook data received in Next.js

**Solutions**:
- Check `helvetiforma_nextjs_url` setting
- Verify webhook secret matches
- Check WordPress error logs
- Test webhook URL manually

### Debug Mode

Enable debug logging in WordPress:

```php
// Add to wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check logs at: `/wp-content/debug.log`

## 📊 Monitoring

### WordPress Logs
Monitor these log entries:
- `"Tutor LMS integration completed for user ID: X"`
- `"Webhook sent to Next.js: tutor_lms_integration_completed"`
- `"Set subscriber role for user ID: X"`

### Next.js Logs
Monitor webhook endpoint:
- `"User registered in WordPress: X"`
- `"Tutor LMS integration completed for user: X"`

## 🔒 Security Considerations

1. **API Protection**: The registration endpoint is public by design
2. **Webhook Security**: Use webhook secrets for authentication
3. **Input Validation**: All inputs are sanitized
4. **Rate Limiting**: Consider adding rate limiting for production

## 📈 Performance Optimization

1. **Non-blocking Webhooks**: Webhooks don't block user registration
2. **Cache Clearing**: Automatic Tutor LMS cache refresh
3. **Error Handling**: Graceful fallbacks if Tutor LMS is unavailable
4. **Logging**: Comprehensive logging for debugging

## 🎯 Success Criteria

✅ **User registers** on Next.js app  
✅ **User created** in WordPress with subscriber role  
✅ **User appears** in Tutor LMS as "Apprenant"  
✅ **Admin notified** via email  
✅ **Webhook sent** to Next.js (optional)  
✅ **No manual intervention** required  

## 📞 Support

If you encounter issues:

1. **Check logs** first (WordPress and Next.js)
2. **Verify configuration** (URLs, secrets, etc.)
3. **Test components** individually
4. **Check Tutor LMS** plugin status

The system is designed to be robust and self-healing, but proper configuration is essential for smooth operation.

