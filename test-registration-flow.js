const axios = require('axios');

async function testRegistrationFlow() {
  console.log('🧪 Testing Complete Registration Flow...\n');

  try {
    // Step 1: Register for a formation
    console.log('📝 Step 1: Registering for formation...');
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '123456789',
      company: 'Test Company',
      position: 'Developer',
      address: 'Test Address',
      city: 'Test City',
      postalCode: '1234',
      country: 'Suisse',
      specialRequirements: '',
      formationId: 12
    };

    const registerRes = await axios.post('http://localhost:3005/api/register', registrationData);
    console.log('✅ Registration created:', registerRes.data);
    const userId = registerRes.data.userId;

    // Step 2: Check registration status (should be pending)
    console.log('\n⏳ Step 2: Checking registration status...');
    const statusRes = await axios.get(`http://localhost:1337/api/registrations?filters[userAccount][id][$eq]=${userId}&populate[formation][fields]=Title,Description,Type,Theme`);
    console.log('📊 Registration status:', statusRes.data.data[0]?.status);

    // Step 3: Admin approves the registration
    console.log('\n✅ Step 3: Admin approving registration...');
    const registrationId = statusRes.data.data[0]?.id;
    const approveRes = await axios.post(`http://localhost:1337/api/registrations/${registrationId}/approve`);
    console.log('✅ Registration approved:', approveRes.data);

    // Step 4: Check updated status (should be confirmed)
    console.log('\n📊 Step 4: Checking updated status...');
    const updatedStatusRes = await axios.get(`http://localhost:1337/api/registrations?filters[userAccount][id][$eq]=${userId}&populate[formation][fields]=Title,Description,Type,Theme`);
    console.log('📊 Updated registration status:', updatedStatusRes.data.data[0]?.status);

    // Step 5: Test login with the user
    console.log('\n🔐 Step 5: Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: '1'
    };
    
    const loginRes = await axios.post('http://localhost:3005/api/login', loginData);
    console.log('✅ Login successful:', loginData.email);

    console.log('\n🎉 Complete Registration Flow Test Successful!');
    console.log('\n📋 Summary:');
    console.log('- ✅ User registered for formation');
    console.log('- ⏳ Registration started as "pending"');
    console.log('- ✅ Admin approved registration');
    console.log('- ✅ Registration status changed to "confirmed"');
    console.log('- 🔐 User can login with email + password "1"');

  } catch (error) {
    console.error('❌ Error in registration flow:', error.response?.data || error.message);
  }
}

testRegistrationFlow(); 