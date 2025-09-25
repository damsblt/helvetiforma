import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function extractProductIdFromHtml(html: string): number | null {
  try {
    const inputMatch = html.match(/name=["']add-to-cart["']\s+value=["'](\d+)["']/i);
    if (inputMatch) return parseInt(inputMatch[1], 10);
    const dataMatch = html.match(/data-product_id=["'](\d+)["']/i);
    if (dataMatch) return parseInt(dataMatch[1], 10);
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  if (!slug && !id) {
    return NextResponse.json({ success: false, error: 'slug or id required' }, { status: 400 });
  }

  try {
    // 1) Try REST with both post types
    const endpoints = [
      `${WORDPRESS_URL}/wp-json/wp/v2/courses?${slug ? `slug=${encodeURIComponent(slug)}` : `include=${encodeURIComponent(id!)}`}&_fields=id,slug,product_id,_tutor_course_product_id` ,
      `${WORDPRESS_URL}/wp-json/wp/v2/tutor_course?${slug ? `slug=${encodeURIComponent(slug)}` : `include=${encodeURIComponent(id!)}`}&_fields=id,slug,product_id,_tutor_course_product_id`
    ];

    for (const url of endpoints) {
      try {
        const data = await fetchJson(url);
        const course = Array.isArray(data) ? data[0] : data;
        const productId = course?.product_id || course?._tutor_course_product_id;
        if (productId) {
          return NextResponse.json({ success: true, product_id: Number(productId), course_id: course?.id, slug: course?.slug });
        }
      } catch {}
    }

    // 2) Fallback: fetch the public course page and parse product ID
    const coursePath = `${WORDPRESS_URL}/courses/${encodeURIComponent(slug || id!)}/`;
    const htmlRes = await fetch(coursePath, { cache: 'no-store' });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const parsed = extractProductIdFromHtml(html);
      if (parsed) {
        return NextResponse.json({ success: true, product_id: parsed, course_id: null, slug: slug || id });
      }
    }

    return NextResponse.json({ success: false, error: 'product_id not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'unknown error' }, { status: 500 });
  }
}


