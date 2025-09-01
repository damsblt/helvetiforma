// Test script for updated TutorLMS service
// Run with: node test-updated-service.js

const BASE_URL = 'https://api.helvetiforma.ch';

// Test the updated service methods
async function testUpdatedService() {
  console.log('🚀 Testing Updated TutorLMS Service...\n');
  
  try {
    // Test 1: Get all courses
    console.log('📚 Test 1: Getting all courses...');
    const coursesResponse = await fetch(`${BASE_URL}/wp-json/wp/v2/courses?per_page=100&_embed`);
    if (coursesResponse.ok) {
      const courses = await coursesResponse.json();
      console.log(`✅ Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        const course = courses[0];
        console.log(`📖 First course: ${course.title?.rendered} (ID: ${course.id})`);
        console.log(`🏷️ Categories: ${course['course-category']?.length || 0}`);
        console.log(`🏷️ Tags: ${course['course-tag']?.length || 0}`);
      }
    }
    
    // Test 2: Get course categories
    console.log('\n📁 Test 2: Getting course categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/wp-json/wp/v2/course-category`);
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`✅ Found ${categories.length} course categories`);
      
      if (categories.length > 0) {
        categories.forEach((cat, index) => {
          console.log(`  ${index + 1}. ${cat.name} (ID: ${cat.id})`);
        });
      }
    }
    
    // Test 3: Get course tags
    console.log('\n🏷️ Test 3: Getting course tags...');
    const tagsResponse = await fetch(`${BASE_URL}/wp-json/wp/v2/course-tag`);
    if (tagsResponse.ok) {
      const tags = await tagsResponse.json();
      console.log(`✅ Found ${tags.length} course tags`);
      
      if (tags.length > 0) {
        tags.forEach((tag, index) => {
          console.log(`  ${index + 1}. ${tag.name} (ID: ${tag.id})`);
        });
      }
    }
    
    // Test 4: Test lessons endpoint (should return empty for now)
    console.log('\n📖 Test 4: Testing lessons endpoint...');
    try {
      const lessonsResponse = await fetch(`${BASE_URL}/wp-json/wp/v2/lessons?course=24`);
      if (lessonsResponse.ok) {
        const lessons = await lessonsResponse.json();
        console.log(`✅ Lessons endpoint working, found ${lessons.length} lessons`);
      } else {
        console.log(`ℹ️ Lessons endpoint not available yet (${lessonsResponse.status})`);
      }
    } catch (error) {
      console.log('ℹ️ Lessons endpoint not available yet');
    }
    
    // Test 5: Test topics endpoint (should return empty for now)
    console.log('\n📝 Test 5: Testing topics endpoint...');
    try {
      const topicsResponse = await fetch(`${BASE_URL}/wp-json/wp/v2/topics?course=24`);
      if (topicsResponse.ok) {
        const topics = await topicsResponse.json();
        console.log(`✅ Topics endpoint working, found ${topics.length} topics`);
      } else {
        console.log(`ℹ️ Topics endpoint not available yet (${topicsResponse.status})`);
      }
    } catch (error) {
      console.log('ℹ️ Topics endpoint not available yet');
    }
    
    console.log('\n✨ Testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUpdatedService();
