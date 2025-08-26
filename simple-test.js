const axios = require('axios');

async function testBasicFlow() {
  console.log('🧪 Testing Basic Registration Flow...\n');

  try {
    // Test 1: Check if backend is responding
    console.log('📡 Test 1: Backend connectivity...');
    const formationsRes = await axios.get('http://localhost:1337/api/formations');
    console.log('✅ Backend is responding, found', formationsRes.data.data?.length || 0, 'formations');

    // Test 2: Check if frontend is responding
    console.log('\n🌐 Test 2: Frontend connectivity...');
    const frontendRes = await axios.get('http://localhost:3005');
    console.log('✅ Frontend is responding (status:', frontendRes.status, ')');

    // Test 3: Check registrations API
    console.log('\n📋 Test 3: Registrations API...');
    const registrationsRes = await axios.get('http://localhost:1337/api/registrations');
    console.log('✅ Registrations API working, found', registrationsRes.data.data?.length || 0, 'registrations');

    console.log('\n🎉 All basic connectivity tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to http://localhost:3005/formations/12');
    console.log('2. Click "S\'inscrire maintenant"');
    console.log('3. Fill out the registration form');
    console.log('4. Check status in personal space');
    console.log('5. Use Admin panel to approve registration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.status || error.message);
    if (error.response?.status === 404) {
      console.log('💡 Tip: Make sure both servers are running:');
      console.log('   - Backend: npm run develop (in helvetiforma-backend)');
      console.log('   - Frontend: npm run dev (in helvetiforma-frontend)');
    }
  }
}

testBasicFlow(); 