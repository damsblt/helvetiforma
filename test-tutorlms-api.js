// Test script for TutorLMS API integration
// Run with: node test-tutorlms-api.js

const BASE_URL = 'https://api.helvetiforma.ch';

// Test basic WordPress REST API
async function testWordPressAPI() {
  console.log('🔍 Testing WordPress REST API...');
  
  try {
    const response = await fetch(`${BASE_URL}/wp-json/wp/v2/courses`);
    if (response.ok) {
      const courses = await response.json();
      console.log('✅ WordPress API working!');
      console.log(`📚 Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        console.log('\n📋 Available courses:');
        courses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title?.rendered || course.title} (ID: ${course.id})`);
        });
      }
      
      return courses;
    } else {
      console.log(`❌ WordPress API error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ WordPress API connection failed:', error.message);
    return null;
  }
}

// Test TutorLMS specific endpoints
async function testTutorLMSEndpoints() {
  console.log('\n🔍 Testing TutorLMS specific endpoints...');
  
  const endpoints = [
    '/wp-json/tutor/v1/courses',
    '/wp-json/tutor/v1/lessons',
    '/wp-json/tutor/v1/topics',
    '/wp-json/tutor/v1/quizzes'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} - Working (${data.length || 'data'} items)`);
      } else {
        console.log(`❌ ${endpoint} - Error ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection failed`);
    }
  }
}

// Test WooCommerce API (if configured)
async function testWooCommerceAPI() {
  console.log('\n🔍 Testing WooCommerce API...');
  
  try {
    const response = await fetch(`${BASE_URL}/wp-json/wc/v3/products`);
    if (response.ok) {
      const products = await response.json();
      console.log('✅ WooCommerce API working!');
      console.log(`🛍️ Found ${products.length} products`);
      
      if (products.length > 0) {
        console.log('\n📦 Available products:');
        products.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} (ID: ${product.id}) - ${product.price} ${product.currency}`);
        });
      }
      
      return products;
    } else {
      console.log(`❌ WooCommerce API error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ WooCommerce API connection failed:', error.message);
    return null;
  }
}

// Test specific course by ID
async function testSpecificCourse(courseId = 24) {
  console.log(`\n🔍 Testing specific course ID: ${courseId}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/wp-json/wp/v2/courses/${courseId}`);
    if (response.ok) {
      const course = await response.json();
      console.log('✅ Course found!');
      console.log(`📚 Title: ${course.title?.rendered || course.title}`);
      console.log(`📝 Excerpt: ${course.excerpt?.rendered || course.excerpt}`);
      console.log(`🏷️ Status: ${course.status}`);
      console.log(`📅 Date: ${course.date}`);
      
      // Check for TutorLMS specific meta
      if (course.meta) {
        console.log('\n🔧 Course Meta Data:');
        Object.entries(course.meta).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            console.log(`  ${key}: ${value}`);
          }
        });
      }
      
      return course;
    } else {
      console.log(`❌ Course not found or error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Course API call failed:', error.message);
    return null;
  }
}

// Test course lessons
async function testCourseLessons(courseId = 24) {
  console.log(`\n🔍 Testing lessons for course ID: ${courseId}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/wp-json/wp/v2/lessons?course=${courseId}`);
    if (response.ok) {
      const lessons = await response.json();
      console.log(`✅ Found ${lessons.length} lessons for course ${courseId}`);
      
      if (lessons.length > 0) {
        console.log('\n📖 Course Lessons:');
        lessons.forEach((lesson, index) => {
          console.log(`${index + 1}. ${lesson.title?.rendered || lesson.title} (ID: ${lesson.id})`);
        });
      }
      
      return lessons;
    } else {
      console.log(`❌ Lessons API error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Lessons API call failed:', error.message);
    return null;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting TutorLMS API Tests...\n');
  
  // Test WordPress API
  const courses = await testWordPressAPI();
  
  // Test TutorLMS endpoints
  await testTutorLMSEndpoints();
  
  // Test WooCommerce API
  const products = await testWooCommerceAPI();
  
  // Test specific course
  const course = await testSpecificCourse(24);
  
  // Test course lessons
  const lessons = await testCourseLessons(24);
  
  console.log('\n🎯 Test Summary:');
  console.log(`📚 Courses available: ${courses ? courses.length : 0}`);
  console.log(`🛍️ Products available: ${products ? products.length : 0}`);
  console.log(`📖 Lessons in course 24: ${lessons ? lessons.length : 0}`);
  
  if (course) {
    console.log(`✅ Course 24 is accessible via API`);
  }
  
  console.log('\n✨ API testing completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testWordPressAPI,
  testTutorLMSEndpoints,
  testWooCommerceAPI,
  testSpecificCourse,
  testCourseLessons,
  runAllTests
};
