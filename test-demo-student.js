const testDemoStudent = async () => {
  // Test data for demo student
  const demoStudent = {
    user_id: 1, // Existing user "gibivawa"
    course_id: 24, // Gestion des Salaires
    student_info: {
      name: "Jean Dupont (Demo)",
      email: "jean.dupont@demo.com",
      username: "jean_dupont_demo"
    }
  };

  console.log('Creating demo student enrollment with data:', demoStudent);

  try {
    // First, let's test the enrollment API
    const enrollmentResponse = await fetch('http://localhost:3000/api/enroll-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: demoStudent.user_id,
        course_id: demoStudent.course_id
      }),
    });

    const enrollmentResult = await enrollmentResponse.json();
    
    console.log('Enrollment Response status:', enrollmentResponse.status);
    console.log('Enrollment Response data:', JSON.stringify(enrollmentResult, null, 2));

    if (enrollmentResult.success) {
      console.log('\n✅ Demo student enrolled successfully!');
      console.log('Student ID:', demoStudent.user_id);
      console.log('Course ID:', demoStudent.course_id);
      console.log('Enrollment ID:', enrollmentResult.enrollment_id);
      
      // Now let's test fetching the student's courses
      console.log('\n📚 Testing student dashboard...');
      
      const dashboardResponse = await fetch(`http://localhost:3000/api/student-courses?user_id=${demoStudent.user_id}`);
      const dashboardResult = await dashboardResponse.json();
      
      console.log('Dashboard Response status:', dashboardResponse.status);
      console.log('Dashboard Response data:', JSON.stringify(dashboardResult, null, 2));
      
      if (dashboardResult.success) {
        console.log('\n✅ Student dashboard data retrieved successfully!');
        console.log('Enrolled courses:', dashboardResult.data.enrolled_courses.length);
        console.log('Course details:', dashboardResult.data.enrolled_courses);
      } else {
        console.log('\n❌ Failed to fetch student dashboard:');
        console.log('Error:', dashboardResult.error);
      }
      
    } else {
      console.log('\n❌ Failed to enroll demo student:');
      console.log('Error:', enrollmentResult.error);
      if (enrollmentResult.details) {
        console.log('Details:', enrollmentResult.details);
      }
    }

  } catch (error) {
    console.error('❌ Error with demo student:', error);
  }
};

// Run the test
testDemoStudent();
