const axios = require('axios');

async function testEnrollment() {
  try {
    console.log('Testing enrollment endpoint...');
    
    // Test the enrollment endpoint
    const enrollData = {
      userId: 17, // Use the user ID from previous test
      formationId: 12
    };

    console.log('Enrolling user with data:', enrollData);
    
    const enrollRes = await axios.post('http://localhost:1337/api/user-accounts/enroll', enrollData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Enrollment result:', enrollRes.data);

    // Verify the enrollment
    console.log('Verifying enrollment...');
    const verifyRes = await axios.get('http://localhost:1337/api/user-accounts/17?populate=enrolledFormations', {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('User data after enrollment:', verifyRes.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEnrollment(); 