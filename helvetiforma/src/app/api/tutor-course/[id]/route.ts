import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;

    // First, get the course from the courses list to get basic info
    const coursesListUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/courses`;
    console.log('Fetching course from courses list:', coursesListUrl);

    const coursesResponse = await fetch(coursesListUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!coursesResponse.ok) {
      const errorData = await coursesResponse.json();
      console.error('Tutor LMS courses list API failed:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de la récupération des cours: ${errorData.message || 'Erreur inconnue'}`,
          details: errorData
        },
        { status: coursesResponse.status }
      );
    }

    const coursesData = await coursesResponse.json();
    const courses = coursesData.data?.posts || [];
    const course = courses.find((c: any) => c.ID == courseId);

    if (!course) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cours non trouvé'
        },
        { status: 404 }
      );
    }

    // Now get the detailed course information
    const detailsUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/courses/${courseId}`;
    console.log('Fetching course details from:', detailsUrl);

    const detailsResponse = await fetch(detailsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    let courseDetails = {};
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      courseDetails = detailsData.data || {};
    }

    console.log('Course details fetched successfully for ID:', courseId);

    // Transform the data to match our expected format
    const transformedCourse = {
      id: course.ID || course.id,
      title: course.post_title || course.title,
      content: (course.post_content || course.content || '')
        .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
        .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
        .trim(),
      excerpt: (course.post_excerpt || course.excerpt || '')
        .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
        .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
        .trim(),
      slug: course.post_name || course.slug,
      status: course.post_status || course.status,
      date: course.post_date || course.date,
      modified: course.post_modified || course.modified,
      author: course.post_author || course.author,
      guid: course.guid,
      thumbnail_url: course.thumbnail_url,
      additional_info: courseDetails,
      ratings: course.ratings || {},
      course_category: course.course_category || [],
      course_tag: course.course_tag || [],
      price: course.price || '',
      meta: {
        course_duration: (courseDetails as any).course_duration?.[0] ? 
          `${(courseDetails as any).course_duration[0].hours}h ${(courseDetails as any).course_duration[0].minutes}min` : 
          (course.additional_info?.course_duration?.[0] ? 
            `${course.additional_info.course_duration[0].hours}h ${course.additional_info.course_duration[0].minutes}min` : 
            'Non spécifié'),
        course_level: (courseDetails as any).course_level?.[0] || course.additional_info?.course_level?.[0] || 'Tous niveaux',
        course_price: course.price || ((courseDetails as any).course_price_type?.[0] === 'free' || course.additional_info?.course_price_type?.[0] === 'free' ? 'Gratuit' : 'Prix sur demande'),
        course_rating: course.ratings?.rating_avg || 0,
        course_rating_count: course.ratings?.rating_count || 0,
        course_students_count: 0,
        course_thumbnail: course.thumbnail_url || null,
        course_categories: course.course_category?.map((cat: any) => cat.name) || [],
        course_tags: course.course_tag?.map((tag: any) => tag.name) || [],
        course_benefits: (courseDetails as any).course_benefits || course.additional_info?.course_benefits || [],
        course_requirements: (courseDetails as any).course_requirements || course.additional_info?.course_requirements || [],
        course_target_audience: (courseDetails as any).course_target_audience || course.additional_info?.course_target_audience || [],
        course_material_includes: (courseDetails as any).course_material_includes || course.additional_info?.course_material_includes || [],
        course_settings: (courseDetails as any).course_settings?.[0] || course.additional_info?.course_settings?.[0] || {},
        course_price_type: (courseDetails as any).course_price_type || course.additional_info?.course_price_type || []
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        course: transformedCourse
      }
    });

  } catch (error) {
    console.error('Tutor course details API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
