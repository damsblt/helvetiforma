const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

import { wooCommerceService } from '@/services/woocommerceService';

type TutorCourseLite = {
  ID?: number;
  id?: number;
  post_title?: string;
  title?: string;
  price?: string | number;
  meta?: Record<string, any>;
};

async function fetchTutorCoursesPage(page: number): Promise<TutorCourseLite[]> {
  const authHeader = process.env.TUTOR_CLIENT_ID && process.env.TUTOR_SECRET_KEY
    ? `Basic ${Buffer.from(`${process.env.TUTOR_CLIENT_ID}:${process.env.TUTOR_SECRET_KEY}`).toString('base64')}`
    : '';

  const url = `${WORDPRESS_URL}/wp-json/tutor/v1/courses?page=${page}`;

  const res = await fetch(url, {
    headers: authHeader
      ? {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      : { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    // If unauthorized, return empty to avoid failing the cron
    return [];
  }

  try {
    const data = await res.json();
    // Tutor typically returns { data: { posts: [...] } }
    const posts = data?.data?.posts || data?.data || data || [];
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

async function getAllProductsIndexedByCourseId(): Promise<Map<string, any>> {
  const map = new Map<string, any>();
  let page = 1;
  const perPage = 100;

  while (true) {
    const products = await wooCommerceService.getProducts({ per_page: perPage, page });
    if (!products || products.length === 0) break;

    for (const product of products) {
      const courseId = product.meta_data?.find((m: any) => m.key === '_tutor_course_id')?.value;
      if (courseId) {
        map.set(String(courseId), product);
      }
    }

    if (products.length < perPage) break;
    page += 1;
    if (page > 25) break; // safety cap
  }

  return map;
}

function sanitizePrice(price: unknown): string | null {
  if (price === undefined || price === null) return null;
  const str = String(price).replace(/[^0-9.,]/g, '').replace(',', '.');
  if (!str) return null;
  const num = parseFloat(str);
  if (!Number.isFinite(num) || num < 0) return null;
  return num.toFixed(2);
}

export async function syncAllCoursePrices(): Promise<{ updated: number; skipped: number; missing: number; }> {
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  const courseIdToProduct = await getAllProductsIndexedByCourseId();

  // Iterate Tutor courses (up to a few pages)
  for (let page = 1; page <= 10; page++) {
    const courses = await fetchTutorCoursesPage(page);
    if (courses.length === 0) break;

    for (const course of courses) {
      const courseId = String((course as any).ID ?? (course as any).id ?? '');
      if (!courseId) { skipped++; continue; }

      const product = courseIdToProduct.get(courseId);
      if (!product) { missing++; continue; }

      const priceRaw = (course as any).price ?? course?.meta?._course_price ?? '';
      const price = sanitizePrice(priceRaw);
      if (!price) { skipped++; continue; }

      const updatePayload: any = {
        regular_price: price,
        meta_data: [
          { key: '_price', value: price },
          { key: '_regular_price', value: price },
        ],
      };

      try {
        await wooCommerceService.updateProduct(product.id, updatePayload);
        updated++;
      } catch {
        skipped++;
      }
    }
  }

  return { updated, skipped, missing };
}

export async function syncSingleCoursePrice(courseId: number): Promise<{ success: boolean; updated: boolean; message: string }>{
  const map = await getAllProductsIndexedByCourseId();
  const product = map.get(String(courseId));
  if (!product) return { success: false, updated: false, message: 'No product for course' };

  // Try fetching single course details
  const authHeader = process.env.TUTOR_CLIENT_ID && process.env.TUTOR_SECRET_KEY
    ? `Basic ${Buffer.from(`${process.env.TUTOR_CLIENT_ID}:${process.env.TUTOR_SECRET_KEY}`).toString('base64')}`
    : '';
  const res = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/courses/${courseId}`, {
    headers: authHeader ? { 'Authorization': authHeader } : undefined
  });
  if (!res.ok) return { success: false, updated: false, message: 'Tutor API not accessible' };
  const data = await res.json();
  const price = sanitizePrice(data?.data?.price ?? data?.price ?? '');
  if (!price) return { success: false, updated: false, message: 'No price found' };

  await wooCommerceService.updateProduct(product.id, {
    regular_price: price,
    meta_data: [
      { key: '_price', value: price },
      { key: '_regular_price', value: price },
    ],
  });

  return { success: true, updated: true, message: 'Price updated' };
}


