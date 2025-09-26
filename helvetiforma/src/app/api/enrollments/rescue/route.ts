import { NextRequest, NextResponse } from 'next/server';
import { tutorLmsService } from '@/services/tutorLmsService';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_APP_USER = process.env.WORDPRESS_APP_USER || 'gibivawa';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.WORDPRESS_WEBHOOK_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { email, courseId } = await request.json();
    if (!email || !courseId) {
      return NextResponse.json({ success: false, error: 'email and courseId required' }, { status: 400 });
    }

    // Resolve WP user by email
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;
    const userResp = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': wpAuth }
    });

    if (!userResp.ok) {
      const err = await userResp.json().catch(() => ({}));
      return NextResponse.json({ success: false, error: 'WP user lookup failed', details: err }, { status: 502 });
    }

    const users = await userResp.json();
    const user = Array.isArray(users) ? users.find((u: any) => u?.email?.toLowerCase() === email.toLowerCase()) : null;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found in WordPress' }, { status: 404 });
    }

    const ok = await tutorLmsService.enrollStudent(user.id, parseInt(courseId.toString()));
    if (ok) {
      return NextResponse.json({ success: true, userId: user.id, courseId });
    }
    return NextResponse.json({ success: false, error: 'Tutor enrollment failed' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
