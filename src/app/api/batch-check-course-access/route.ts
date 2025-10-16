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
    
    // Check each course individually using the existing check-course-access logic
    for (const courseId of courseIds) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/check-course-access?userId=${userId}&courseId=${courseId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          accessMap[courseId] = data.hasAccess || false;
        } else {
          console.warn(`⚠️ Failed to check access for course ${courseId}:`, response.status);
          accessMap[courseId] = false;
        }
      } catch (error) {
        console.warn(`⚠️ Error checking access for course ${courseId}:`, error);
        accessMap[courseId] = false;
      }
    }

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

