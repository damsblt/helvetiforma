const axios = require('axios');

async function main() {
  const WORDPRESS_URL = 'https://api.helvetiforma.ch';
  const CK = 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
  const CS = 'cs_1082d09580773bcad56caf213542171abbd8d076';
  const wooAuth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

  const ts = Date.now();
  const username = `student_${ts}`;
  const email = `${username}@example.com`;
  const password = `P@ss-${ts}`;
  const courseId = 247; // target course/product id

  try {
    console.log('👤 Creating WooCommerce customer → WP user...');
    const createCustomer = await axios.post(
      `${WORDPRESS_URL}/wp-json/wc/v3/customers`,
      {
        email,
        first_name: 'WP',
        last_name: 'Tutor Student',
        username,
        password
      },
      { headers: { Authorization: wooAuth, 'Content-Type': 'application/json' } }
    );

    const userId = createCustomer.data.id;
    console.log('✅ Customer created:', { id: userId, email });

    console.log('📚 Creating enrollment order...');
    const enrollmentData = {
      payment_method: 'helvetiforma_enrollment',
      payment_method_title: 'HelvetiForma Enrollment',
      set_paid: true,
      status: 'completed',
      customer_id: userId,
      line_items: [
        {
          product_id: courseId,
          quantity: 1,
          name: `Course Enrollment - ${courseId}`
        }
      ],
      meta_data: [
        { key: '_helvetiforma_enrollment', value: 'yes' },
        { key: '_enrollment_course_id', value: String(courseId) },
        { key: '_enrollment_user_id', value: String(userId) },
        { key: '_enrollment_date', value: new Date().toISOString() }
      ]
    };

    const orderRes = await axios.post(
      `${WORDPRESS_URL}/wp-json/wc/v3/orders`,
      enrollmentData,
      { headers: { Authorization: wooAuth, 'Content-Type': 'application/json' } }
    );

    console.log('✅ Enrollment order created:', { order_id: orderRes.data.id, status: orderRes.data.status });

    console.log('🔎 Verifying latest enrollment orders...');
    const listRes = await axios.get(
      `${WORDPRESS_URL}/wp-json/wc/v3/orders`,
      {
        headers: { Authorization: wooAuth, 'Content-Type': 'application/json' },
        params: { per_page: 5, orderby: 'date', order: 'desc' }
      }
    );

    const enrollmentOrders = listRes.data.filter(o =>
      o.payment_method === 'helvetiforma_enrollment' ||
      (Array.isArray(o.meta_data) && o.meta_data.some(m => m.key === '_helvetiforma_enrollment'))
    );
    console.log('📊 Enrollment orders (recent):', enrollmentOrders.map(o => ({ id: o.id, customer_id: o.customer_id, status: o.status })));

    console.log('🎉 Done');
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

main();


