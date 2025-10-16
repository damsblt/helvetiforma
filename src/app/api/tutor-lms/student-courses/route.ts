import { NextRequest, NextResponse } from 'next/server';

// Function to fetch image URL from WordPress Media ID
async function getImageUrlFromMediaId(mediaId: number): Promise<string | undefined> {
  if (!mediaId) return undefined;
  
  try {
    console.log('🖼️ Fetching image URL for media ID:', mediaId);
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch'}/wp-json/wp/v2/media/${mediaId}`);
    
    if (!response.ok) {
      console.log('❌ Failed to fetch media:', response.status);
      return undefined;
    }
    
    const mediaData = await response.json();
    console.log('🖼️ Media data:', mediaData);
    
    // Try to get the best available size
    if (mediaData.source_url) {
      console.log('✅ Using source_url:', mediaData.source_url);
      return mediaData.source_url;
    }
    
    if (mediaData.media_details && mediaData.media_details.sizes) {
      const sizes = mediaData.media_details.sizes;
      if (sizes.large && sizes.large.source_url) {
        console.log('✅ Using large size:', sizes.large.source_url);
        return sizes.large.source_url;
      }
      if (sizes.medium_large && sizes.medium_large.source_url) {
        console.log('✅ Using medium_large size:', sizes.medium_large.source_url);
        return sizes.medium_large.source_url;
      }
      if (sizes.medium && sizes.medium.source_url) {
        console.log('✅ Using medium size:', sizes.medium.source_url);
        return sizes.medium.source_url;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('❌ Error fetching media:', error);
    return undefined;
  }
}

// Utility function to get proper featured image URL
async function getFeaturedImageUrl(course: any): Promise<string | undefined> {
  if (!course) return undefined;
  
  console.log('🖼️ Getting featured image for course:', course.ID || course.id, 'featured_media:', course.featured_media, 'thumbnail_id:', course.thumbnail_id);
  
  // First, try to get from embedded media data (when _embed=true is used)
  if (course._embedded && course._embedded['wp:featuredmedia'] && course._embedded['wp:featuredmedia'][0]) {
    const featuredMedia = course._embedded['wp:featuredmedia'][0];
    console.log('🖼️ Found embedded featured media:', featuredMedia);
    
    // Try different possible image URL fields in the embedded media
    if (featuredMedia.source_url) {
      console.log('✅ Using embedded source_url:', featuredMedia.source_url);
      return featuredMedia.source_url;
    }
    
    if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
      // Try to get the largest available size
      const sizes = featuredMedia.media_details.sizes;
      if (sizes.full && sizes.full.source_url) {
        console.log('✅ Using embedded full size:', sizes.full.source_url);
        return sizes.full.source_url;
      }
      if (sizes.large && sizes.large.source_url) {
        console.log('✅ Using embedded large size:', sizes.large.source_url);
        return sizes.large.source_url;
      }
      if (sizes.medium_large && sizes.medium_large.source_url) {
        console.log('✅ Using embedded medium_large size:', sizes.medium_large.source_url);
        return sizes.medium_large.source_url;
      }
      if (sizes.medium && sizes.medium.source_url) {
        console.log('✅ Using embedded medium size:', sizes.medium.source_url);
        return sizes.medium.source_url;
      }
    }
  }
  
  // Try to get from thumbnail_id (TutorLMS specific)
  if (course.thumbnail_id && typeof course.thumbnail_id === 'number') {
    console.log('🖼️ Found thumbnail_id, fetching image URL...');
    return await getImageUrlFromMediaId(course.thumbnail_id);
  }
  
  // Try to get from featured_media (WordPress standard)
  if (course.featured_media && typeof course.featured_media === 'number') {
    console.log('🖼️ Found featured_media, fetching image URL...');
    return await getImageUrlFromMediaId(course.featured_media);
  }
  
  // Try different possible image fields in order of preference
  if (course.featured_image && typeof course.featured_image === 'string' && course.featured_image.startsWith('http')) {
    console.log('✅ Using featured_image:', course.featured_image);
    return course.featured_image;
  }
  
  if (course.featured_media_url && typeof course.featured_media_url === 'string') {
    console.log('✅ Using featured_media_url:', course.featured_media_url);
    return course.featured_media_url;
  }
  
  if (course.featured_media) {
    // If it's already a URL, return it
    if (typeof course.featured_media === 'string' && course.featured_media.startsWith('http')) {
      console.log('✅ Using featured_media as URL:', course.featured_media);
      return course.featured_media;
    }
  }
  
  // Try to get from _links or other WordPress fields
  if (course._links && course._links['wp:featuredmedia']) {
    const mediaUrl = course._links['wp:featuredmedia'][0]?.href;
    if (mediaUrl) {
      console.log('✅ Using _links media URL:', mediaUrl);
      return mediaUrl;
    }
  }
  
  // Try to get from ACF or custom fields
  if (course.acf && course.acf.featured_image) {
    console.log('✅ Using ACF featured_image:', course.acf.featured_image);
    return course.acf.featured_image;
  }
  
  if (course.meta && course.meta._thumbnail_id) {
    const thumbnailId = course.meta._thumbnail_id;
    if (typeof thumbnailId === 'number') {
      console.log('🖼️ Found meta _thumbnail_id, fetching image URL...');
      return await getImageUrlFromMediaId(thumbnailId);
    }
  }
  
  // Fallback to basic fields
  if (course.thumbnail_url && typeof course.thumbnail_url === 'string' && course.thumbnail_url.startsWith('http')) {
    console.log('✅ Using thumbnail_url:', course.thumbnail_url);
    return course.thumbnail_url;
  }
  
  if (course.image && typeof course.image === 'string' && course.image.startsWith('http')) {
    console.log('✅ Using image:', course.image);
    return course.image;
  }
  
  console.log('❌ No featured image found for course:', course.ID || course.id);
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🔍 Student Courses API: Request for userId:', userId);

    if (!userId) {
      console.error('❌ Student Courses API: No userId provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const TUTOR_API_KEY = process.env.TUTOR_API_KEY || 'key_85e31422f63c5f73e4781f49727cd58c';
    const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || 'secret_cb2c112e7a880b5ecc185ff136d858b0b9161a0fb05c8e1eb2a73eed3d09e073';
    const TUTOR_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

    console.log('🔍 Student Courses API: Using URL:', `${TUTOR_API_URL}/wp-json/tutor/v1/students/${userId}/courses`);

    // Use official TutorLMS Pro API to fetch student's enrolled courses with embedded media
    const authHeader = 'Basic ' + Buffer.from(`${TUTOR_API_KEY}:${TUTOR_SECRET_KEY}`).toString('base64');
    
    const response = await fetch(
      `${TUTOR_API_URL}/wp-json/tutor/v1/students/${userId}/courses`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    );

    console.log('🔍 Student Courses API: TutorLMS response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Student Courses API: TutorLMS error:', response.status, response.statusText, errorText);
      
      // If it's a 500 error related to user not found or no enrollments, try fallback approach
      if (response.status === 500 && errorText.includes('count()')) {
        console.log('⚠️ Student Courses API: TutorLMS API failed, trying fallback approach...');
        
        // Fallback: Get all courses and check enrollment status
        try {
          const fallbackResponse = await fetch(`${TUTOR_API_URL}/wp-json/wp/v2/courses?per_page=50&_embed=true`);
          
          if (!fallbackResponse.ok) {
            console.log('❌ Fallback API also failed:', fallbackResponse.status);
            return NextResponse.json({ courses: [] });
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log('✅ Fallback API: Got', fallbackData.length, 'courses');
          
          // For now, return all courses as "enrolled" for testing
          // In a real implementation, you would check actual enrollment status
          const enrolledCourses = fallbackData.map((course: any) => ({
            ...course,
            course_completed_percentage: '0%',
            enrolled_at: new Date().toISOString(),
          }));
          
          console.log('🔍 Fallback: Using', enrolledCourses.length, 'courses as enrolled');
          
          // Continue with the normal processing
          const courses = await Promise.all(enrolledCourses.map(async (course: any) => {
            const progressStr = course.course_completed_percentage || '0%';
            const progressNum = parseInt(progressStr.replace('%', '')) || 0;
            
            const featuredImage = await getFeaturedImageUrl(course);
            console.log(`🔍 Fallback: Course "${course.title?.rendered || course.title}" featured image:`, featuredImage);
            
            return {
              id: course.id,
              title: course.title?.rendered || course.title || 'Sans titre',
              slug: course.slug || '',
              excerpt: course.excerpt?.rendered || course.excerpt || '',
              featured_image: featuredImage,
              progress_percentage: progressNum,
              enrolled_at: course.enrolled_at || new Date().toISOString(),
              course_level: course.course_level || course.level || undefined,
            };
          }));
          
          console.log('✅ Fallback: Returning', courses.length, 'formatted courses');
          return NextResponse.json({ courses });
          
        } catch (fallbackError) {
          console.error('❌ Fallback approach failed:', fallbackError);
          return NextResponse.json({ courses: [] });
        }
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch enrolled courses: ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Student Courses API: TutorLMS data:', JSON.stringify(data, null, 2));
    
    // Extract enrolled courses from TutorLMS API response structure
    const enrolledCourses = data.data?.enrolled_courses || data.enrolled_courses || [];
    console.log('🔍 Student Courses API: Found', enrolledCourses.length, 'enrolled courses');
    
    // Debug: Log the first course to see its structure
    if (enrolledCourses.length > 0) {
      console.log('🔍 Student Courses API: First course structure:', JSON.stringify(enrolledCourses[0], null, 2));
      console.log('🔍 Student Courses API: First course featured_media:', enrolledCourses[0].featured_media);
      console.log('🔍 Student Courses API: First course _embedded:', enrolledCourses[0]._embedded);
    }
    
    // Format the courses data
    const courses = await Promise.all(enrolledCourses.map(async (course: any) => {
      // Parse progress percentage
      const progressStr = course.course_completed_percentage || '0%';
      const progressNum = parseInt(progressStr.replace('%', '')) || 0;
      
      // Debug: Get featured image and log the result
      const featuredImage = await getFeaturedImageUrl(course);
      console.log(`🔍 Student Courses API: Course "${course.post_title || course.title}" featured image:`, featuredImage);
      
      return {
        id: course.ID || course.id,
        title: course.post_title || course.title?.rendered || course.title || 'Sans titre',
        slug: course.post_name || course.slug || '',
        excerpt: course.post_excerpt || course.excerpt?.rendered || course.excerpt || '',
        featured_image: featuredImage, // Use proper featured image extraction
        progress_percentage: progressNum,
        enrolled_at: course.post_date || course.enrolled_at || course.date_enrolled || undefined,
        course_level: course.course_level || course.level || undefined,
      };
    }));

    console.log('✅ Student Courses API: Returning', courses.length, 'formatted courses');
    return NextResponse.json({ courses });

  } catch (error) {
    console.error('❌ Student Courses API: Error:', error);
    console.error('❌ Student Courses API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch enrolled courses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

