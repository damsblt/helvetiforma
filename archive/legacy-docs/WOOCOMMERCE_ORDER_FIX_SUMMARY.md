# WooCommerce Order Creation Fix for Courses

## ⚠️ IMPORTANT: Two Separate Flows

This fix **ONLY** affects **TutorLMS COURSES**, not articles/posts.

### Flow 1: TutorLMS Courses (MODIFIED)
- **API**: `src/app/api/tutor-lms/enrollments/route.ts`
- **Purpose**: Course enrollment with TutorLMS
- **WooCommerce Product**: Linked to course via title search
- **WooCommerce Metadata**: `_course_id`, `_course_purchase`, `_payment_intent_id`
- **Product SKU**: Found by searching course title
- **Must be Virtual**: YES (required for auto-enrollment)

### Flow 2: Articles/Posts (UNCHANGED)
- **API**: `src/app/api/payment/record-purchase/route.ts`
- **Purpose**: Article purchase tracking
- **WooCommerce Product**: Created automatically via ACF hooks
- **WooCommerce Metadata**: `_helvetiforma_article_id`, `_post_id`, `_user_id`
- **Product SKU**: `article-{postId}`
- **Must be Virtual**: YES (already set)

---

## Problem

When enrolling users in **TutorLMS courses**, WooCommerce orders were not being created, even though TutorLMS enrollments were successful.

**Root Cause**: WooCommerce order creation was only happening inside the payment verification block (`if (amount && amount > 0 && paymentIntentId)`), which meant:
- Free courses never created WooCommerce orders
- If payment verification failed, no WooCommerce order was created
- WooCommerce hooks for TutorLMS auto-enrollment were not triggered

## Solution

### Changes Made to `src/app/api/tutor-lms/enrollments/route.ts`

**1. Moved WooCommerce order creation outside payment block** (Lines 184-312)
- Now **ALWAYS** attempts to create a WooCommerce order for courses
- Happens regardless of course price (free or paid)
- Required per TutorLMS best practices for triggering enrollment hooks

**2. Added virtual product check and update** (Lines 240-261)
- Checks if the course's WooCommerce product is marked as `virtual`
- Automatically updates product to `virtual: true` if not set
- **Critical**: Per TutorLMS documentation, products MUST be virtual for auto-enrollment

**3. Enhanced logging**
- Added detailed logs for product search
- Added logs for virtual product status
- Added logs for WooCommerce order creation success/failure

## TutorLMS Requirements (from TutorBot)

Per TutorLMS official documentation:

1. **Products must be Virtual**
   - WooCommerce product must have `virtual: true`
   - Required for automatic order completion
   - Required for enrollment hooks to trigger

2. **Enable "Automatically Complete WooCommerce Orders"**
   - In Tutor LMS Settings → Monetization
   - Ensures order status changes to "Completed" automatically
   - Triggers enrollment on payment success

3. **Student Redirect**
   - After successful payment, students are redirected to enrolled courses
   - Happens automatically when order is completed

## Flow Diagram (Courses Only)

```
User Completes Stripe Payment
         ↓
Enrollment API Called
         ↓
Payment Verified (if paid course)
         ↓
🔄 SEARCH for WooCommerce Product (by course title)
         ↓
✅ Product Found
         ↓
🔍 CHECK if product.virtual === true
         ↓
❌ If not virtual → UPDATE product to virtual: true
         ↓
📦 CREATE WooCommerce Order
         ├─ customer_id: WordPress user ID
         ├─ status: 'completed'
         ├─ line_items: [{ product_id }]
         └─ meta_data: { _course_id, _payment_intent_id }
         ↓
⏳ Wait 2 seconds for WordPress hooks
         ↓
🎓 CREATE TutorLMS Enrollment (via API)
         ├─ POST /tutor/v1/enrollments
         └─ user_id, course_id
         ↓
✅ COMPLETE Enrollment (auto-approve)
         ├─ PUT /tutor/v1/enrollments/completed
         └─ enrollment_id, status: 'completed'
         ↓
✅ User Enrolled & Can Access Course
```

## Testing

### Test Course Enrollment (user ID 224)

1. **Go through checkout**:
   ```
   http://localhost:3000/courses/charges-sociales-test-123-2/checkout
   ```

2. **Check Next.js logs for**:
   ```
   📦 Creating WooCommerce order with course product...
   ✅ Found product ID by title search: XXX
   🔍 Product is virtual: true (or "updating to virtual")
   ✅ WooCommerce order created: XXX Total: 30.00
   🎓 Creating TutorLMS enrollment via official API...
   ✅ TutorLMS enrollment created: {...}
   ✅ Enrollment marked as completed: {...}
   ```

3. **Verify in WordPress**:
   - WooCommerce → Orders → Find new order for user 224
   - Order should have:
     - Status: Completed
     - Line item: Course product
     - Meta: `_course_id`, `_course_purchase`
   
   - Tutor LMS → Enrollments → Find enrollment
   - Enrollment should have:
     - User: 224
     - Course: Charges sociales
     - Status: Completed

### Important: Ensure TutorLMS Settings

1. Go to WordPress admin → Tutor LMS → Settings → Monetization
2. Enable "Automatically Complete WooCommerce Orders"
3. Ensure WooCommerce is selected as monetization method

## Files Modified

**ONLY this file was changed for the course WooCommerce order fix:**
- ✅ `src/app/api/tutor-lms/enrollments/route.ts`

**These files were NOT modified (article flow unchanged):**
- ❌ `src/app/api/payment/record-purchase/route.ts` - Article purchases
- ❌ `src/app/api/payment/webhook/route.ts` - Article Stripe webhooks
- ❌ `wordpress-functions-FINAL-FIXED.php` - Article automation (ACF hooks)

## Debugging

### No WooCommerce Order Created

Check Next.js logs for:
```
⚠️ No WooCommerce product linked to this course
```

**Solution**: Ensure the course has a linked WooCommerce product in WordPress:
1. Edit course in WordPress
2. Scroll to "Product for this course"
3. Select or create a WooCommerce product
4. Save course

### Order Created but Enrollment Still Pending

Check:
1. **Product is virtual**: Look for log `✅ Product updated to virtual`
2. **TutorLMS settings**: Enable "Automatically Complete WooCommerce Orders"
3. **WordPress error logs**: Check for enrollment hook errors
4. **TutorLMS enrollment API**: Look for error in enrollment completion step

### Free Courses

Free courses (`amount: 0`) will:
- ✅ Create WooCommerce order with `total: 0`
- ✅ Create TutorLMS enrollment directly
- ✅ Mark enrollment as completed

## Next Steps

1. ✅ Test course enrollment with user 224
2. ✅ Verify WooCommerce order is created
3. ✅ Verify enrollment status is "Completed" in TutorLMS
4. ✅ Verify course products are marked as virtual
5. ✅ Test both paid and free courses

**Article flow remains unchanged and should continue working as before.**

