# WordPress Deployment Instructions

## Critical: Upload WordPress Changes

The console errors you're seeing are caused by the WordPress site at `api.helvetiforma.ch` setting restrictive headers. You need to upload the updated `functions.php` file to resolve the iframe embedding issues.

### Files to Upload

1. **Upload this file to your WordPress site:**
   ```
   data/helvetiforma-child/functions.php
   ```

2. **Upload location on WordPress server:**
   ```
   /wp-content/themes/helvetiforma-child/functions.php
   ```

### What the WordPress Changes Fix

The updated `functions.php` file includes:

- ✅ Removes restrictive `X-Frame-Options` headers
- ✅ Adds proper `Content-Security-Policy` for iframe embedding
- ✅ Adds `Permissions-Policy` for payment features
- ✅ Disables WordPress.com stats scripts that cause console errors
- ✅ Allows framing from your domains (helvetiforma.ch, vercel.app, localhost)

### How to Upload

**Option 1: FTP/SFTP**
1. Connect to your WordPress hosting via FTP/SFTP
2. Navigate to `/wp-content/themes/helvetiforma-child/`
3. Upload the `functions.php` file
4. Overwrite the existing file

**Option 2: WordPress Admin (if file editing is enabled)**
1. Log into WordPress Admin at `https://api.helvetiforma.ch/wp-admin`
2. Go to Appearance → Theme Editor
3. Select "HelvetiForma Child" theme
4. Click on `functions.php`
5. Replace the content with the updated version
6. Click "Update File"

**Option 3: cPanel File Manager**
1. Log into your hosting cPanel
2. Open File Manager
3. Navigate to `/public_html/wp-content/themes/helvetiforma-child/`
4. Upload the `functions.php` file

### After Upload

Once uploaded, the following errors should be resolved:
- ❌ `Refused to display 'https://api.helvetiforma.ch/' in a frame because it set 'X-Frame-Options' to 'sameorigin'`
- ❌ `stats.wp.com` script blocking errors
- ❌ Payment permissions policy violations

### Testing

After uploading, test by:
1. Refreshing your Next.js application
2. Checking browser console for errors
3. Verifying iframe content loads properly

### Alternative Solution

If you cannot upload the WordPress changes immediately, you can use the new fallback component:

Replace your iframe components with:
```tsx
import WpIframeWithFallback from '@/components/WpIframeWithFallback';

// Instead of WpFullScreenIframe
<WpIframeWithFallback src={iframeSrc} isFullScreen={true} />

// Instead of WpEmbeddedIframe  
<WpIframeWithFallback src={iframeSrc} heightOffsetPx={64} />
```

This will show a fallback message with a "Open in New Tab" button if the iframe fails to load.

