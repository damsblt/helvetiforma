# HelvetiForma Payment Workflow Test

## Test Objective
Test the complete payment workflow: Product 300 → Cart → Payment → WooCommerce Order → WordPress User → Tutor LMS Enrollment

## Test Data
- **Product ID**: 300
- **Course ID**: 299 (Tutor LMS)
- **Test Email**: damien_balet@outlook.com
- **Website**: https://helvetiforma.vercel.app/

## Step-by-Step Test Process

### 1. Navigate to Product 300
- Go to: https://helvetiforma.vercel.app/courses/300
- **Expected**: Product page loads with "Add to Cart" button
- **Check**: Product name, price (should be 500 CHF), description

### 2. Add to Cart
- Click "Add to Cart" button
- **Expected**: Product added to cart, cart icon shows item count
- **Check**: Cart total should be 500 CHF + TVA (540 CHF total)

### 3. Go to Cart Page
- Navigate to: https://helvetiforma.vercel.app/cart
- **Expected**: Cart shows product 300 with correct pricing
- **Check**: 
  - Product name: "Impôt à la source - Test"
  - Price: 500.00 CHF
  - Total: 540.00 CHF (including 8% TVA)

### 4. Proceed to Checkout
- Click "Commander" (Order) button
- **Expected**: Redirected to checkout page
- **Check**: Checkout form loads properly

### 5. Fill Checkout Form
- **Email**: damien_balet@outlook.com
- **First Name**: Damien
- **Last Name**: Balet
- **Address**: Test Address
- **City**: Geneva
- **Postal Code**: 1200
- **Country**: Switzerland
- **Expected**: Form accepts all data

### 6. Complete Payment
- Use test Stripe card: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **Expected**: Payment processes successfully

### 7. Payment Success
- **Expected**: Redirected to payment success page
- **Check**: Success message shows
- **Expected URL**: `/payment-success?payment_intent=pi_...&redirect_status=succeeded`

## What to Track and Verify

### A. WooCommerce Order Creation
**Check in WordPress Admin:**
1. Go to: `api.helvetiforma.ch/wp-admin/admin.php?page=wc-orders`
2. **Expected**: New order #XXX with:
   - Customer: damien_balet@outlook.com
   - Status: Completed
   - Total: 500.00 CHF (NOT 0.00 CHF)
   - Payment method: Stripe
   - Line items: Product 300

### B. WooCommerce Customer Creation
**Check in WordPress Admin:**
1. Go to: `api.helvetiforma.ch/wp-admin/admin.php?page=wc-customers`
2. **Expected**: New customer with:
   - Email: damien_balet@outlook.com
   - Name: Damien Balet
   - Linked to WordPress user

### C. WordPress User Creation
**Check in WordPress Admin:**
1. Go to: `api.helvetiforma.ch/wp-admin/users.php`
2. **Expected**: New user with:
   - Username: damien_balet_XXXXXXXX (with timestamp)
   - Email: damien_balet@outlook.com
   - Role: Subscriber
   - First Name: Damien
   - Last Name: Balet

### D. Tutor LMS Enrollment
**Check in WordPress Admin:**
1. Go to: `api.helvetiforma.ch/wp-admin/admin.php?page=tutor-students`
2. **Expected**: Student enrolled in course 299 with:
   - Status: Completed/Approved
   - Enrollment date: Today
   - Course: Course linked to product 300

### E. Email Delivery
**Check Email Inbox:**
1. Look for email from HelvetiForma
2. **Expected**: Welcome email with:
   - Username and email
   - Password reset link
   - Course information
   - Login instructions

## Potential Issues to Watch For

### 1. WooCommerce Order Issues
- **Issue**: Order shows 0.00 CHF instead of 500.00 CHF
- **Cause**: Missing total field in order creation
- **Status**: ✅ Fixed in latest code

### 2. WordPress User Creation Issues
- **Issue**: No WordPress user created
- **Cause**: WordPress user creation failing
- **Check**: API logs for user creation errors

### 3. Tutor LMS Enrollment Issues
- **Issue**: Student not enrolled or enrollment pending
- **Cause**: Enrollment API failing or not approved
- **Check**: API logs for enrollment errors

### 4. Email Delivery Issues
- **Issue**: No welcome email received
- **Cause**: Email service not working
- **Check**: API logs for email sending errors

## Debugging Commands

### Check API Logs
```bash
# Check Vercel deployment logs
vercel logs https://helvetiforma.vercel.app/

# Check specific payment success endpoint
vercel logs https://helvetiforma.vercel.app/ --filter="payment-success"
```

### Check Database
```sql
-- Check WooCommerce orders
SELECT * FROM wp_posts WHERE post_type = 'shop_order' ORDER BY post_date DESC LIMIT 5;

-- Check WordPress users
SELECT * FROM wp_users ORDER BY user_registered DESC LIMIT 5;

-- Check Tutor LMS enrollments
SELECT * FROM wp_tutor_enrolled ORDER BY enrolled_date DESC LIMIT 5;
```

## Success Criteria
✅ WooCommerce order created with correct amount (500 CHF)
✅ WooCommerce customer created and linked to WordPress user
✅ WordPress subscriber created with proper role
✅ Tutor LMS enrollment completed and approved
✅ Welcome email sent with login credentials
✅ Student can login and access course 299

## Test Results Template
```
Test Date: ___________
Test Email: damien_balet@outlook.com
Product ID: 300
Course ID: 299

Results:
□ WooCommerce Order: [Order ID] - [Amount] - [Status]
□ WooCommerce Customer: [Customer ID] - [Email] - [Linked to WP User]
□ WordPress User: [User ID] - [Username] - [Role] - [Email]
□ Tutor LMS Enrollment: [Enrollment ID] - [Course ID] - [Status]
□ Email Delivery: [Sent/Not Sent] - [Subject] - [Contains Credentials]

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: [PASS/FAIL]
```
