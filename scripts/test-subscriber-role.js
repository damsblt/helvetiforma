/*
  Quick background test: create a temp WP user as subscriber via REST API,
  verify roles, then delete the user. Requires env:
  - NEXT_PUBLIC_WORDPRESS_URL (e.g., https://api.helvetiforma.ch)
  - WORDPRESS_APP_USER (e.g., gibivawa)
  - WORDPRESS_APP_PASSWORD (application password)
*/

const fetch = global.fetch;

async function main() {
  const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
  const WP_USER = process.env.WORDPRESS_APP_USER;
  const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('Missing WORDPRESS_APP_USER or WORDPRESS_APP_PASSWORD in env.');
    process.exit(2);
  }

  const auth = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const username = `test_sub_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = Math.random().toString(36).slice(2) + 'A1!';

  let userId = null;
  try {
    console.log('Creating temp WP user with roles [subscriber]...');
    const createRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users`, {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, roles: ['subscriber'], send_user_notification: false })
    });
    const created = await createRes.json();
    if (!createRes.ok) {
      console.error('Create failed:', created);
      process.exit(1);
    }
    userId = created.id;
    console.log('Created user id:', userId, 'roles:', created.roles);

    console.log('Fetching user to verify roles...');
    const getRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}?context=edit`, {
      headers: { 'Authorization': auth }
    });
    const got = await getRes.json();
    console.log('Current roles:', got.roles);

    if (Array.isArray(got.roles) && got.roles.includes('subscriber')) {
      console.log('✅ Role is subscriber as expected');
    } else {
      console.error('❌ Role is NOT subscriber:', got.roles);
      process.exitCode = 1;
    }
  } catch (e) {
    console.error('Error during test:', e);
    process.exitCode = 1;
  } finally {
    if (userId) {
      try {
        console.log('Deleting temp user:', userId);
        const delRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}?reassign=1&force=true`, {
          method: 'DELETE',
          headers: { 'Authorization': auth }
        });
        const del = await delRes.json();
        console.log('Delete result:', del.deleted ? 'deleted' : del);
      } catch {}
    }
  }
}

main();


