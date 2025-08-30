# 📧 EmailJS Setup Guide

## 🚀 **How to Set Up EmailJS for Your Contact Form**

### **Step 1: Create EmailJS Account**
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### **Step 2: Create Email Service**
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. **Save the Service ID** (you'll need this)

### **Step 3: Create Email Template**
1. Go to "Email Templates"
2. Click "Create New Template"
3. Design your email template with these variables:
   ```
   {{from_name}} - Sender's name
   {{from_email}} - Sender's email
   {{subject}} - Message subject
   {{message}} - Message content
   ```
4. **Save the Template ID** (you'll need this)

### **Step 4: Get Your Public Key**
1. Go to "Account" → "API Keys"
2. **Copy your Public Key**

### **Step 5: Configure Your App**
1. Create a `.env.local` file in your project root
2. Add these variables:
   ```env
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```
3. Replace the placeholder values with your actual IDs

### **Step 6: Test Your Form**
1. Restart your development server
2. Fill out the contact form
3. Submit and check your email inbox

## 📋 **Example Email Template**

```html
<h2>Nouveau message de contact</h2>

<p><strong>De :</strong> {{from_name}} ({{from_email}})</p>
<p><strong>Sujet :</strong> {{subject}}</p>

<h3>Message :</h3>
<p>{{message}}</p>

<hr>
<p><em>Message envoyé depuis le formulaire de contact Helvetiforma</em></p>
```

## 🔒 **Security Notes**
- ✅ Public keys are safe to expose in frontend code
- ✅ Service and template IDs are also safe to expose
- ✅ EmailJS handles authentication securely
- ✅ No backend server required

## 💰 **Pricing**
- **Free Tier**: 200 emails/month
- **Paid Plans**: Start at $15/month for 1,000 emails
- **Perfect for**: Small to medium businesses

## 🆘 **Need Help?**
- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- Support: Available in EmailJS dashboard
