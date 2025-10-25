import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, courseIds } = await request.json();

    if (!userId || !courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { error: 'userId and courseIds array are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Batch checking access for user ${userId} and ${courseIds.length} courses`);

    // Use WordPress/TutorLMS integration instead of Supabase
    const accessMap: { [key: number]: boolean } = {};
    
    // Check all courses in parallel for better performance
    const checkPromises = courseIds.map(async (courseId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/check-course-access?userId=${userId}&courseId=${courseId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { courseId, hasAccess: data.hasAccess || false };
        } else {
          console.warn(`⚠️ Failed to check access for course ${courseId}:`, response.status);
          return { courseId, hasAccess: false };
        }
      } catch (error) {
        console.warn(`⚠️ Error checking access for course ${courseId}:`, error);
        return { courseId, hasAccess: false };
      }
    });
    
    // Wait for all checks to complete in parallel
    const results = await Promise.all(checkPromises);
    
    // Build the access map
    results.forEach(({ courseId, hasAccess }) => {
      accessMap[courseId] = hasAccess;
    });

    console.log('✅ Batch access check complete:', Object.values(accessMap).filter(Boolean).length, 'courses accessible');

    return NextResponse.json({ accessMap });
  } catch (error) {
    console.error('❌ Error in batch check course access:', error);
    return NextResponse.json(
      { error: 'Failed to check course access' },
      { status: 500 }
    );
  }
}

