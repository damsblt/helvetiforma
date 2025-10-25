# Course Enrollment & Pricing Fixes

## Issues Identified

### 1. ❌ Access Denied Despite WordPress Enrollment
- **Problem**: User `baletdamien@gmail.com` (ID: 210/211) is enrolled in WordPress but cannot access `/learn` page
- **Root Cause**: 
  - Local enrollment tracker is empty
  - TutorLMS Pro API endpoints for checking enrollments are not available or require different authentication
  - The WordPress user ID mapping is inconsistent

### 2. ❌ 0 CHF Price Instead of 30 CHF
- **Problem**: Stripe and WooCommerce show 0 CHF instead of 30 CHF
- **Root Cause**: 
  - Course data from `/wp-json/wp/v2/courses/3633` doesn't include `_tutor_course_product_id` in the `meta` field
  - The price retrieval logic wasn't fetching from the linked WooCommerce product

## Solutions Implemented

### ✅ Fix 1: Updated Course Price Retrieval
**File**: `src/lib/tutor-lms.ts` - `formatTutorCourse()` function

**Changes**:
```typescript
// Now checks for linked WooCommerce product ID in multiple ways:
1. course.meta._tutor_course_product_id
2. course._tutor_course_product_id
3. Fetches price directly from WooCommerce API using product ID
4. Falls back to WooCommerce product list matching by title/slug
5. Last resort: static price mapping
```

**Result**: Course prices will now be correctly fetched from the linked WooCommerce product (30 CHF).

### ✅ Fix 2: Updated Access Check to Use WordPress Role
**File**: `src/app/api/check-course-access/route.ts`

**Changes**:
```typescript
// Now checks enrollment in this order:
1. Local enrollment tracker (in-memory)
2. WordPress user roles (tutor_student or administrator)
3. Custom functions.php endpoint /tutor/v1/check-enrollment
```

**Result**: Users with `tutor_student` role will be granted access.

## Required Actions in WordPress

### 🔧 Action 1: Add Custom Endpoints to functions.php

The custom enrollment check endpoints need to be added to your WordPress theme's `functions.php` file. Copy the code from:

**Option A**: Use the complete corrected version
- File: `/wordpress-functions-corrected.php`
- This includes all the necessary endpoints and the auto-enrollment logic

**Option B**: Use the dedicated plugin files
- File: `/wordpress-plugin/tutor-enrollment-functions.php`
- Add this to your theme's `functions.php` or install as a mu-plugin

### 🔧 Action 2: Ensure TutorLMS Course-Product Linking

**Check in WordPress Admin**:
1. Go to **TutorLMS → Courses → Edit "Charges sociales - Test 123"**
2. In the **Pricing Model** section, ensure:
   - ✅ **Payé** is selected
   - ✅ Product is selected: "Charges sociales - Test 123"
   - ✅ **Prix normal**: 30 CHF

**Verify Product Meta**:
```bash
# Check if product ID is in course meta
curl "https://api.helvetiforma.ch/wp-json/wp/v2/courses/3633" \
  -u "contact@helvetiforma.ch:RWnb nSO6 6TMX yWd0 HWFl HBYh" | jq '.meta'
```

Expected output should include:
```json
{
  "_tutor_course_product_id": "SOME_PRODUCT_ID"
}
```

### 🔧 Action 3: Grant tutor_student Role

Ensure enrolled users have the `tutor_student` role:

**Manual Fix**:
1. Go to **WordPress Admin → Users**
2. Edit user `baletdamien@gmail.com`
3. Check role includes `tutor_student`

**Automatic Fix via functions.php**:
The auto-enrollment code in `wordpress-functions-corrected.php` already handles this:
```php
if (!in_array('tutor_student', $user->roles)) {
    $user->add_role('tutor_student');
}
```

## Testing Steps

### Test 1: Check Course Price
```bash
# From your app
curl "http://localhost:3000/api/tutor-lms/courses" | jq '.[] | select(.slug == "charges-sociales-test-123-2") | {title, course_price}'
```

**Expected**: `"course_price": 30`

### Test 2: Check Course Access
```bash
# Replace USER_ID with correct ID (210 or 211)
curl "http://localhost:3000/api/check-course-access?userId=USER_ID&courseId=3633" | jq '.'
```

**Expected**: `"hasAccess": true`

### Test 3: Complete Purchase Flow
1. Navigate to course: `http://localhost:3000/courses/charges-sociales-test-123-2`
2. Click "Acheter maintenant"
3. Complete Stripe payment with test card: `4242 4242 4242 4242`
4. Verify:
   - ✅ Stripe shows **30 CHF** (not 0)
   - ✅ WooCommerce order shows **30 CHF**
   - ✅ User is enrolled in TutorLMS
   - ✅ User can access `/learn` page

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_USERNAME=contact@helvetiforma.ch
WORDPRESS_APPLICATION_PASSWORD=RWnb nSO6 6TMX yWd0 HWFl HBYh

WOOCOMMERCE_CONSUMER_KEY=your_key
WOOCOMMERCE_CONSUMER_SECRET=your_secret

TUTOR_API_KEY=key_85e31422f63c5f73e4781f49727cd58c
TUTOR_SECRET_KEY=secret_cb2c112e7a880b5ecc185ff136d858b0b9161a0fb05c8e1eb2a73eed3d09e073

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Next Steps

1. ✅ Code fixes have been applied to the Next.js app
2. ⏳ Add custom enrollment endpoints to WordPress `functions.php`
3. ⏳ Verify course-product linking in WordPress admin
4. ⏳ Test the complete purchase and enrollment flow
5. ⏳ Verify existing enrolled user can access `/learn` page

## Rollback Plan

If issues persist:
1. Check WordPress error logs: `/wp-content/debug.log`
2. Check Next.js server logs for API errors
3. Verify WooCommerce product exists and has correct price
4. Confirm TutorLMS enrollment exists in database: `wp_tutor_enrolled` table
