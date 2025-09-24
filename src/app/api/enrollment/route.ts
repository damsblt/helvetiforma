import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').trim();
const TUTOR_API_URL = (process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch').trim();
const TUTOR_CLIENT_ID = (process.env.TUTOR_CLIENT_ID || '').trim();
const TUTOR_SECRET_KEY = (process.env.TUTOR_SECRET_KEY || '').trim();
const WORDPRESS_APP_USER = (process.env.WORDPRESS_APP_USER || '').trim();

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_ids } = await request.json();
    console.log('[ENROLL] API called with:', { user_id, course_ids });
    if (!user_id || !Array.isArray(course_ids) || course_ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing user_id or course_ids' }, { status: 400 });
    }

    const results: Array<{ course_id: number, success: boolean, enrollment_id?: number|string, error?: string }> = [];

    for (const cid of course_ids) {
      const res = await enrollAndComplete(user_id, Number(cid));
      console.log('[ENROLL] result for course', cid, res);
      results.push({ course_id: Number(cid), ...res });
      // brief delay
      await new Promise(r => setTimeout(r, 250));
    }

    const ok = results.every(r => r.success);
    console.log('[ENROLL] Completed with success =', ok);
    return NextResponse.json({ success: ok, results });
  } catch (error) {
    console.error('[ENROLL] Fatal error:', error);
    return NextResponse.json({ success: false, error: 'Enrollment error', details: String(error) }, { status: 500 });
  }
}

async function enrollAndComplete(userId: number, courseId: number): Promise<{ success: boolean; enrollment_id?: number|string; error?: string }> {
  // Strategy A: Tutor REST using Tutor client/secret
  const attempts: Array<() => Promise<Response>> = [];
  if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
    attempts.push(() => {
      const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
      return fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, course_id: courseId, status: 'completed' })
      });
    });
  }
  if (process.env.WORDPRESS_APP_PASSWORD) {
    attempts.push(() => {
      const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
      return fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, course_id: courseId, status: 'completed' })
      });
    });
  }

  // Try attempts
  for (let i = 0; i < attempts.length; i++) {
    try {
      const res = await attempts[i]();
      console.log('[ENROLL] attempt', i + 1, 'status', res.status);
      const body: any = await res.json().catch(() => undefined);
      if (!res.ok) {
        console.warn('[ENROLL] attempt body (failure):', body);
      }
      if (res.ok) {
        const enrollmentId = body?.data?.enrollment_id || body?.enrollment_id || undefined;
        console.log('[ENROLL] success body:', body);
        // Try to mark completed using official endpoint
        await completeEnrollment(enrollmentId);
        return { success: true, enrollment_id: enrollmentId };
      }
    } catch (e) {}
  }
  return { success: false, error: 'All enrollment strategies failed' };
}

async function completeEnrollment(enrollmentId?: number|string) {
  if (!enrollmentId) return;
  const payload = { enrollment_id: enrollmentId } as any;
  // Prefer Tutor creds
  if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
    try {
      const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
      const res = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments/completed`, {
        method: 'PUT', headers: { 'Authorization': auth, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      console.log('[ENROLL] complete via Tutor creds status', res.status);
      if (res.ok) return;
    } catch {}
  }
  if (process.env.WORDPRESS_APP_PASSWORD) {
    try {
      const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
      const r = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments/completed`, {
        method: 'PUT', headers: { 'Authorization': auth, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      console.log('[ENROLL] complete via WP creds status', r.status);
    } catch {}
  }
}


