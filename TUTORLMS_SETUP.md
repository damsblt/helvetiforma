# TutorLMS + WooCommerce Setup Guide
## Complete Integration for Swiss Training Business

### 🎯 Why This Combination is Perfect for You

**TutorLMS + WooCommerce** gives you:
- ✅ **Professional LMS** - Course management, progress tracking, certificates
- ✅ **E-commerce Power** - Payment processing, invoicing, Swiss VAT compliance
- ✅ **Swiss Market Ready** - Multi-currency (CHF), multi-language support
- ✅ **Seamless Integration** - Works perfectly with your existing WordPress setup
- ✅ **Cost Effective** - Much cheaper than building custom solution

---

## 📋 Prerequisites

### WordPress Requirements
- WordPress 5.8+ (latest recommended)
- PHP 7.4+ (8.0+ recommended)
- MySQL 5.7+ or MariaDB 10.3+
- SSL certificate (required for payments)

### Server Requirements
- **Memory**: 256MB+ (512MB+ recommended)
- **Upload size**: 64MB+ for video content
- **PHP extensions**: cURL, JSON, XML, GD

---

## 🚀 Step-by-Step Installation

### 1. Install Required Plugins

#### Install WooCommerce First
```bash
# Via WordPress Admin
Plugins → Add New → Search "WooCommerce" → Install → Activate

# Or via WP-CLI
wp plugin install woocommerce --activate
```

#### Install TutorLMS
```bash
# Via WordPress Admin
Plugins → Add New → Search "TutorLMS" → Install → Activate

# Or via WP-CLI
wp plugin install tutor-lms --activate
```

### 2. Configure WooCommerce

#### Basic Setup
1. **Go to**: WooCommerce → Settings
2. **General Tab**:
   - **Store address**: Your Swiss business address
   - **Selling location(s)**: Switzerland
   - **Default customer location**: Default to store address
   - **Enable taxes**: ✅ Checked
   - **Currency**: CHF (Swiss Franc)

#### Payment Methods
1. **Payments Tab**:
   - **Bank transfers (BACS)**: ✅ Enabled
   - **PayPal**: ✅ Enabled (for international clients)
   - **Credit cards**: ✅ Enabled (via Stripe/PayPal)

#### Tax Configuration
1. **Tax Tab**:
   - **Enable tax calculations**: ✅ Checked
   - **Display prices during cart and checkout**: Including tax
   - **Display tax totals**: Itemized
   - **Tax based on**: Customer billing address

2. **Add Swiss VAT**:
   - **Tax rate**: 7.7% (Swiss VAT)
   - **Country**: Switzerland
   - **State**: All states
   - **Rate**: 7.7
   - **Shipping**: ✅ Taxable

### 3. Configure TutorLMS

#### General Settings
1. **Go to**: TutorLMS → Settings
2. **General Tab**:
   - **Site Name**: Your training business name
   - **Site Description**: Swiss training services
   - **Currency**: CHF
   - **Date Format**: DD/MM/YYYY (European format)

#### Course Settings
1. **Course Tab**:
   - **Course Archive Page**: Select your courses page
   - **Single Course Page**: Select your single course page
   - **Course Builder**: ✅ Enable
   - **Course Review**: ✅ Enable
   - **Course Certificate**: ✅ Enable

#### WooCommerce Integration
1. **WooCommerce Tab**:
   - **Enable WooCommerce Integration**: ✅ Checked
   - **Product per page**: 12
   - **Add to cart button**: ✅ Show on course archive
   - **Purchase button**: ✅ Show on single course

---

## 🏗️ Course Structure Setup

### 1. Create Course Categories
```
📁 Gestion RH
├── 📁 Salaires et Paie
├── 📁 Charges Sociales
├── 📁 Droit du Travail
└── 📁 Formation Continue

📁 Fiscalité
├── 📁 Impôt à la Source
├── 📁 TVA
├── 📁 Déclarations Fiscales
└── 📁 Optimisation Fiscale

📁 Comptabilité
├── 📁 Comptabilité Générale
├── 📁 Comptabilité Analytique
├── 📁 Consolidation
└── 📁 Audit
```

### 2. Course Template Structure
```
📚 Formation Salaires - Session Janvier 2025
├── 🎯 Module 1: Introduction aux Salaires
│   ├── 📖 Leçon 1.1: Bases légales suisses
│   ├── 📖 Leçon 1.2: Calcul du salaire brut
│   └── ✅ Quiz 1: Vérification des connaissances
├── 🎯 Module 2: Gestion des Avantages
│   ├── 📖 Leçon 2.1: Avantages en nature
│   ├── 📖 Leçon 2.2: Bonus et primes
│   └── 📝 Devoir 2: Étude de cas
├── 🎯 Module 3: Conformité et Déclarations
│   ├── 📖 Leçon 3.1: Obligations légales
│   ├── 📖 Leçon 3.2: Déclarations sociales
│   └── 🏆 Certificat de formation
```

---

## 💰 WooCommerce Product Setup

### 1. Product Configuration
For each course, create a WooCommerce product:

#### Product Data
- **Type**: Simple product
- **Virtual**: ✅ Checked (no shipping needed)
- **Downloadable**: ✅ Checked (course access)
- **Regular price**: CHF 1,200
- **Sale price**: CHF 980 (if applicable)

#### Inventory
- **SKU**: SAL-2025-01
- **Manage stock**: ✅ Checked
- **Stock quantity**: 12 (course capacity)
- **Low stock threshold**: 3
- **Backorders**: ❌ Don't allow

#### Advanced
- **Purchase note**: "Merci pour votre inscription! Vous recevrez un email de confirmation."
- **Menu order**: 1 (for sorting)

### 2. Product Meta Fields
Add custom fields for course information:
```
_course_duration: "3 jours"
_course_level: "Intermédiaire"
_course_instructor: "Marie Dubois"
_course_location: "Genève, Centre de Formation"
_course_start_date: "2025-01-15"
_course_end_date: "2025-01-17"
_course_type: "présentiel"
_course_certificate: "true"
```

---

## 🔗 Integration with Next.js Frontend

### 1. Environment Variables
Add to your `.env.local`:
```bash
# WordPress
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com

# WooCommerce API
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxx
```

### 2. API Endpoints
Your Next.js app will communicate with these endpoints:

#### WordPress REST API
```
GET /wp-json/wp/v2/courses
GET /wp-json/wp/v2/courses/{id}
GET /wp-json/wp/v2/lessons?course={course_id}
GET /wp-json/wp/v2/topics?course={course_id}
```

#### WooCommerce API
```
GET /wp-json/wc/v3/products
GET /wp-json/wc/v3/orders
POST /wp-json/wc/v3/orders
```

### 3. Frontend Integration
Use the `tutorLmsService` we created:
```typescript
import tutorLmsService from '@/services/tutorLmsService';

// Get all courses with WooCommerce data
const courses = await tutorLmsService.getCourses();

// Enroll user in course
const success = await tutorLmsService.enrollUser(userId, courseId, userData);
```

---

## 🎨 Customization

### 1. Theme Integration
- **Child Theme**: Create a child theme for customizations
- **Custom CSS**: Add Swiss-specific styling
- **Template Overrides**: Customize course templates

### 2. Swiss Market Features
- **Multi-language**: French/German/Italian support
- **Local Payment**: Twint integration
- **VAT Compliance**: Automatic Swiss tax calculations
- **Business Invoicing**: Professional invoice templates

### 3. Advanced Features
- **Certificate Templates**: Custom Swiss certificates
- **Progress Tracking**: Detailed learning analytics
- **Assignment Grading**: Instructor feedback system
- **Discussion Forums**: Student collaboration

---

## 📊 Testing Your Setup

### 1. Test Course Creation
1. Create a test course
2. Add lessons and topics
3. Set up quizzes and assignments
4. Configure WooCommerce product

### 2. Test Enrollment Flow
1. Create test user account
2. Purchase course through WooCommerce
3. Verify course access
4. Test progress tracking

### 3. Test Payment Flow
1. Test bank transfer order
2. Verify order creation
3. Check enrollment status
4. Test certificate generation

---

## 🚀 Going Live

### 1. Production Checklist
- [ ] SSL certificate installed
- [ ] WooCommerce payment methods configured
- [ ] Swiss VAT rates set up
- [ ] Course content uploaded
- [ ] Test enrollments completed
- [ ] Backup system configured

### 2. Performance Optimization
- **Caching**: Install WP Rocket or similar
- **CDN**: Use Cloudflare or similar
- **Database**: Optimize MySQL tables
- **Images**: Compress and optimize

### 3. Security Measures
- **Firewall**: Install Wordfence or similar
- **Backups**: Daily automated backups
- **Updates**: Regular plugin updates
- **Monitoring**: Uptime monitoring

---

## 💡 Pro Tips for Swiss Market

### 1. Localization
- **Language**: French primary, German secondary
- **Currency**: Always display in CHF
- **Date Format**: DD/MM/YYYY
- **Time Zone**: Europe/Zurich

### 2. Business Practices
- **Invoicing**: Professional Swiss invoice format
- **Payment Terms**: 30 days net
- **VAT**: Always include Swiss VAT
- **Contracts**: Swiss law compliant

### 3. Customer Service
- **Response Time**: Within 24 hours
- **Language Support**: French/German/English
- **Local Contact**: Swiss phone numbers
- **Business Hours**: Swiss time zone

---

## 🔧 Troubleshooting

### Common Issues
1. **WooCommerce not connecting**: Check API keys
2. **Courses not showing**: Verify REST API permissions
3. **Payment failures**: Check payment method settings
4. **Enrollment issues**: Verify user roles and permissions

### Support Resources
- **TutorLMS Documentation**: https://docs.themeum.com/tutor-lms/
- **WooCommerce Documentation**: https://docs.woocommerce.com/
- **WordPress Support**: https://wordpress.org/support/

---

## 📈 Next Steps

### Phase 1: Basic Setup (Week 1-2)
- Install and configure plugins
- Set up basic course structure
- Test enrollment flow

### Phase 2: Content Creation (Week 3-4)
- Create course content
- Set up WooCommerce products
- Configure payment methods

### Phase 3: Customization (Week 5-6)
- Customize theme and styling
- Add Swiss-specific features
- Test with real users

### Phase 4: Launch (Week 7-8)
- Final testing and optimization
- Go live with first courses
- Monitor and optimize performance

---

**🎯 Result**: You'll have a professional, Swiss-market-ready training platform that's much more powerful than a custom solution, built in weeks instead of months!

