const testCreateStudent = async () => {
  const studentData = {
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@test.com',
    password: 'TestPassword123!',
    course_id: 24 // Gestion des Salaires
  };

  console.log('Creating new student with data:', studentData);

  try {
    const response = await fetch('http://localhost:3000/api/create-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Student created successfully!');
      console.log('Student ID:', result.student.id);
      console.log('Username:', result.student.username);
      console.log('Email:', result.student.email);
      console.log('Password:', result.student.password);
      console.log('Login URL:', result.student.login_url);
      
      if (result.enrollment) {
        console.log('\n📚 Enrollment details:');
        console.log('Enrollment ID:', result.enrollment.enrollment_id);
        console.log('Course ID:', result.enrollment.course_id);
        console.log('Status:', result.enrollment.status);
      }
    } else {
      console.log('\n❌ Failed to create student:');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Error creating student:', error);
  }
};

// Run the test
testCreateStudent();
