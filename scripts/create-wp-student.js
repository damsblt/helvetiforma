const axios = require('axios');

async function main() {
  const WORDPRESS_URL = 'https://api.helvetiforma.ch';
  const CK = 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
  const CS = 'cs_1082d09580773bcad56caf213542171abbd8d076';
  const APP_PW = '5TIZ tbzH C9va SHsa PBI4 oJod';

  const wooAuth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');
  const wpAuth = 'Basic ' + Buffer.from(`admin:${APP_PW}`).toString('base64');

  const ts = Date.now();
  const username = `student_${ts}`;
  const email = `${username}@example.com`;
  const password = `P@ss-${ts}`;

  console.log('Creating WooCommerce customer → WP user...');
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
  console.log('Customer created:', { id: userId, email });

  console.log('Setting WP user roles → subscriber, customer...');
  try {
    const updateUser = await axios.put(
      `${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`,
      { roles: ['subscriber', 'customer'] },
      { headers: { Authorization: wpAuth, 'Content-Type': 'application/json' } }
    );
    console.log('Roles updated:', updateUser.data.roles || ['not exposed']);
  } catch (e) {
    console.log('Role update failed or roles not writable via API:', e.response?.status, e.response?.data || e.message);
  }

  console.log('Probe TutorLMS students endpoint (may be 403)...');
  try {
    const tutorStudents = await axios.get(
      `${WORDPRESS_URL}/wp-json/tutor/v1/students`,
      { headers: { Authorization: wpAuth } }
    );
    console.log('TutorLMS students reachable. Count:', Array.isArray(tutorStudents.data) ? tutorStudents.data.length : 'unknown');
  } catch (e) {
    console.log('TutorLMS students blocked:', e.response?.status, e.response?.data?.message || e.message);
  }

  console.log('Done. New WP user created.');
}

main().catch(err => {
  console.error('Script error:', err.response?.data || err.message);
  process.exit(1);
});


