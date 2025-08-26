const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration process...');
    
    // Step 1: Create user account
    const userData = {
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: '1',
        isActive: true
      }
    };

    console.log('Creating user account...');
    const userRes = await axios.post('http://localhost:1337/api/user-accounts', userData, {
      headers: { 'Content-Type': 'application/json' }
    });

    const userId = userRes.data.data.id;
    console.log('User created with ID:', userId);

    // Step 2: Create registration
    const registrationData = {
      data: {
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
        formation: 12,
        status: 'pending',
        userAccount: userId
      }
    };

    console.log('Creating registration...');
    const regRes = await axios.post('http://localhost:1337/api/registrations', registrationData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Registration created:', regRes.data);

    // Step 3: Update user with enrolledFormations
    console.log('Updating user enrolledFormations...');
    const updateData = {
      data: {
        enrolledFormations: {
          connect: [12]
        }
      }
    };

    const updateRes = await axios.put(`http://localhost:1337/api/user-accounts/${userId}`, updateData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('User updated:', updateRes.data);

    // Step 4: Verify the update
    console.log('Verifying user data...');
    const verifyRes = await axios.get(`http://localhost:1337/api/user-accounts/${userId}?populate=enrolledFormations`, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('User data with formations:', verifyRes.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testRegistration(); 