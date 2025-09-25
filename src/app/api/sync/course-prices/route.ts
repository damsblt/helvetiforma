import { NextRequest, NextResponse } from 'next/server';
import { syncAllCoursePrices, syncSingleCoursePrice } from '@/services/courseSyncService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const courseId = body?.courseId ? parseInt(String(body.courseId), 10) : undefined;

    if (courseId) {
      const res = await syncSingleCoursePrice(courseId);
      return NextResponse.json({ success: res.success, updated: res.updated, message: res.message });
    }

    const result = await syncAllCoursePrices();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Sync failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await syncAllCoursePrices();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Sync failed' }, { status: 500 });
  }
}


