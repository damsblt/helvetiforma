import { redirect } from 'next/navigation';

export default function StudentDashboardPage() {
  const base = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').trim().replace(/\/$/, '');
  const target = `${base}/tableau-de-bord/`;
  redirect(target);
}
