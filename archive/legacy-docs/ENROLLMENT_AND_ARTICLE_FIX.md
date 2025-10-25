# Course Enrollment and Article Product Creation Fix

## Summary

Fixed two critical issues:
1. **Course enrollment stuck in pending status** - Enhanced TutorLMS API integration
2. **Article product auto-creation not working** - Added ACF-specific hook

## Changes Made

### 1. Enhanced Course Enrollment API (`src/app/api/tutor-lms/enrollments/route.ts`)

**Problem**: Enrollments were being created but stuck in "pending" status instead of "completed".

**Solution**: 
- Enhanced enrollment ID extraction logic to handle multiple TutorLMS API response formats
- Added comprehensive logging to track the enrollment process
- Improved error handling and status tracking

**Key Changes**:
- Lines 340-393: Updated enrollment creation and status update logic
- Now checks for `enrollData.data.enrollment_id` (primary format per TutorLMS Pro API docs)
- Fallback checks for alternative response structures
- Added detailed JSON logging of all API responses
- Added status logging for completion endpoint

**API Flow**:
1. Create WooCommerce order (if paid course)
2. Call `POST /wp-json/tutor/v1/enrollments` with user_id and course_id
3. Extract enrollment_id from response
4. Call `PUT /wp-json/tutor/v1/enrollments/completed` with enrollment_id and status='completed'

### 2. Article Product Auto-Creation (`wordpress-functions-FINAL-FIXED.php`)

**Problem**: When articles were created/edited in WordPress admin with ACF fields set to premium + price, WooCommerce products were not being created automatically.

**Root Cause**: The `save_post` hook fires before ACF has saved the field data, so `get_field()` returns null.

**Solution**: Added ACF-specific hook that fires after ACF saves field data.

**Key Changes**:
- Line 596: Added `add_action('acf/save_post', 'handle_acf_article_save', 20)`
- Lines 631-661: Created new `handle_acf_article_save()` function
- Line 620: Added logging to existing `handle_post_save()` function
- Priority 20 ensures it runs after ACF processes field data

**Hook Execution Order**:
1. `save_post` hook fires (may not have ACF data yet)
2. ACF processes and saves field data
3. `acf/save_post` hook fires with priority 20 (ACF data available)
4. `handle_acf_article_save()` executes and creates/updates WooCommerce product

## Testing

### Test Course Enrollment

1. **Setup**: 
   - User ID 224 (or any valid WordPress user)
   - Course ID 3633
   - Ensure course is linked to WooCommerce product

2. **Test Flow**:
   ```bash
   # Go through checkout at http://localhost:3000/courses/[slug]/checkout
   # Complete Stripe payment
   # Check Next.js terminal for logs
   ```

3. **Expected Logs**:
   ```
   🎓 Creating TutorLMS enrollment via official API...
   ✅ TutorLMS enrollment created: { "data": { "enrollment_id": XXX } }
   📋 Extracted enrollment ID: XXX
   🎯 Marking enrollment as completed: XXX
   📡 Complete enrollment response status: 200
   ✅ Enrollment marked as completed: { ... }
   ```

4. **Verify in WordPress**:
   - Go to WordPress admin → Tutor LMS → Enrollments
   - Find enrollment for user 224 in course 3633
   - Status should be "Completed" (not "Pending")

### Test Article Product Creation

1. **Setup**:
   - Go to WordPress admin → Posts
   - Create or edit an article

2. **Test Flow**:
   - Set ACF field "access" to "premium"
   - Set ACF field "price" to 25 (or any number > 0)
   - Click "Update" or "Publish"

3. **Expected Logs** (WordPress error log):
   ```
   HelvetiForma save_post: Article 123 - Access: premium, Price: 25
   HelvetiForma ACF: Article #123 - Access: premium, Price: 25
   HelvetiForma ACF: Creating/updating WooCommerce product for article #123
   HelvetiForma: Produit WooCommerce créé - ID: 456, SKU: article-123
   ```

4. **Verify in WordPress**:
   - Go to WooCommerce → Products
   - Find product with SKU "article-123"
   - Verify price is 25 CHF
   - Verify product status is "Published"

5. **Verify in Next.js App**:
   - Visit `http://localhost:3000/posts/[article-slug]`
   - If not logged in or haven't purchased: Should see purchase overlay
   - Overlay should show "25.00 CHF" and purchase buttons

## Debugging

### Course Enrollment Issues

If enrollment is still pending:

1. **Check Next.js logs** for TutorLMS API responses:
   ```bash
   # Look for these lines:
   ✅ TutorLMS enrollment created:
   📋 Extracted enrollment ID:
   ```

2. **Verify TutorLMS API credentials**:
   - Check `.env.local` has correct `TUTOR_API_KEY` and `TUTOR_SECRET_KEY`
   - Test authentication: `curl -u "key:secret" https://api.helvetiforma.ch/wp-json/tutor/v1/courses`

3. **Check WordPress error logs** for enrollment hooks:
   ```
   HelvetiForma: Order #XXX completed, checking for course enrollments...
   HelvetiForma: Processing order #XXX for user #224
   ```

### Article Product Issues

If product is not created:

1. **Check WordPress error logs** for ACF hook:
   ```bash
   # Look for these lines:
   HelvetiForma ACF: Article #123 - Access: premium, Price: 25
   HelvetiForma ACF: Creating/updating WooCommerce product for article #123
   ```

2. **Verify ACF fields**:
   - Field name must be exactly "access" (not "access_level" or "accesss")
   - Field name must be exactly "price"
   - Value must be "premium" (lowercase)

3. **Check if hook is registered**:
   - Search `functions.php` for `add_action('acf/save_post', 'handle_acf_article_save', 20)`

4. **Manual trigger** via API:
   ```bash
   curl -X POST "https://api.helvetiforma.ch/wp-json/helvetiforma/v1/sync-article" \
     -H "Content-Type: application/json" \
     -d '{"post_id": 123}'
   ```

## API Reference

- **TutorLMS Pro API Documentation**: https://docs.themeum.com/tutor-lms/developer-documentation/rest-apis-for-tutor-lms-pro/
- **Enrollment endpoint**: `POST /wp-json/tutor/v1/enrollments`
- **Update enrollment status**: `PUT /wp-json/tutor/v1/enrollments/completed`
- **ACF Hooks Documentation**: https://www.advancedcustomfields.com/resources/acf-save_post/

## Files Modified

1. `src/app/api/tutor-lms/enrollments/route.ts` - Enhanced enrollment ID extraction and logging
2. `wordpress-functions-FINAL-FIXED.php` - Added ACF-specific article save hook

## Next Steps

After updating WordPress `functions.php` with the fixed version:

1. Test course enrollment flow with user 224
2. Test article product creation in WordPress admin
3. Monitor WordPress and Next.js logs for any issues
4. If enrollment still pending, check the extracted enrollment_id value
5. If article product not created, verify ACF field names match exactly

