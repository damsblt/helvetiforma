# WooCommerce Duplicate Order Prevention Fix

## Problem Identified

The system was creating **3 WooCommerce orders** for both course purchases and article purchases due to multiple redundant order creation mechanisms:

### For Articles (Posts):
1. **Stripe Webhook Handler** (`src/app/api/payment/webhook/route.ts`)
   - `checkout.session.completed` event
   - `payment_intent.succeeded` event
   - Both events were creating orders for the same purchase

2. **Direct Purchase Recording** (`src/app/api/payment/record-purchase/route.ts`)
   - Created orders when purchases were recorded directly
   - Ran independently of Stripe webhooks

3. **WordPress Hooks** (in `wordpress-functions-FINAL-FIXED.php`)
   - Multiple WordPress hooks that could trigger additional order creation

### For Courses:
1. **TutorLMS Enrollment API** (`src/app/api/tutor-lms/enrollments/route.ts`)
   - Always created WooCommerce orders for course enrollments
   - This was added to fix enrollment issues

2. **WordPress Course Purchase API** (`src/app/api/wordpress/course-purchase/route.ts`)
   - Created WooCommerce orders for course purchases

3. **WordPress Auto-Enrollment Hooks** (in `wordpress-functions-FINAL-FIXED.php`)
   - `woocommerce_order_status_completed` and `woocommerce_payment_complete` hooks
   - Could create additional orders when triggered

## Solution Implemented

### 1. Created Duplicate Prevention Utility
**File**: `src/lib/woocommerce-duplicate-prevention.ts`

This utility provides functions to:
- Check for existing WooCommerce orders with specific metadata
- Log order creation attempts with duplicate detection
- Prevent creation of duplicate orders

**Key Functions**:
- `checkForExistingOrder()` - Generic function to check for existing orders
- `checkForExistingArticleOrder()` - Specific function for article orders
- `checkForExistingCourseOrder()` - Specific function for course orders
- `logOrderCreationAttempt()` - Logging function for debugging

### 2. Updated Webhook Handler
**File**: `src/app/api/payment/webhook/route-fixed.ts`

Added duplicate prevention to both webhook events:
- `checkout.session.completed`
- `payment_intent.succeeded`

**Changes**:
- Check for existing orders before creating new ones
- Skip order creation if duplicate is found
- Log duplicate prevention actions

### 3. Updated Enrollment API
**File**: `src/app/api/tutor-lms/enrollments/route.ts`

Added duplicate prevention to course order creation:
- Check for existing course orders before creating new ones
- Skip order creation if duplicate is found
- Continue with enrollment even if order creation is skipped

### 4. Updated Record Purchase API
**File**: `src/app/api/payment/record-purchase/route.ts`

Added duplicate prevention to article order creation:
- Check for existing article orders before creating new ones
- Return existing order ID if duplicate is found
- Skip order creation if duplicate is found

## How It Works

### Duplicate Detection Logic

The system checks for existing orders using multiple criteria:

1. **Customer ID** - Ensures we're checking orders for the same customer
2. **Product ID** - Ensures we're checking orders for the same product
3. **Metadata** - Checks for specific metadata that identifies the order type:
   - `_post_id` for articles
   - `_course_id` for courses
   - `_stripe_payment_intent_id` for Stripe payments
   - `_stripe_session_id` for Stripe sessions

### Order Creation Flow

1. **Check for Existing Order** - Query WooCommerce API for existing orders
2. **Log Attempt** - Log the order creation attempt with duplicate status
3. **Skip if Duplicate** - If existing order found, skip creation and log warning
4. **Create if New** - If no existing order, proceed with creation

## Files Modified

1. **New File**: `src/lib/woocommerce-duplicate-prevention.ts`
2. **Updated**: `src/app/api/payment/webhook/route.ts` (imports added)
3. **Updated**: `src/app/api/tutor-lms/enrollments/route.ts`
4. **Updated**: `src/app/api/payment/record-purchase/route.ts`
5. **New File**: `src/app/api/payment/webhook/route-fixed.ts` (ready to replace original)

## Testing

To test the fix:

1. **Replace the webhook handler**:
   ```bash
   mv src/app/api/payment/webhook/route-fixed.ts src/app/api/payment/webhook/route.ts
   ```

2. **Test article purchase**:
   - Purchase an article
   - Check WooCommerce orders - should see only 1 order
   - Check logs for duplicate prevention messages

3. **Test course enrollment**:
   - Enroll in a course
   - Check WooCommerce orders - should see only 1 order
   - Check logs for duplicate prevention messages

## Expected Results

- **Before**: 3 WooCommerce orders created per purchase
- **After**: 1 WooCommerce order created per purchase
- **Logs**: Clear indication when duplicates are prevented
- **Performance**: Reduced database load and API calls

## Rollback Plan

If issues occur, rollback by:
1. Reverting the modified files to their original state
2. Removing the duplicate prevention utility
3. The system will return to creating multiple orders (original behavior)

## Monitoring

Monitor the following after deployment:
- WooCommerce order count per purchase
- Log messages indicating duplicate prevention
- System performance (should improve)
- User experience (should remain the same)
