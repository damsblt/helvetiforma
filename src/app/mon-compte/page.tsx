import { redirect } from 'next/navigation';

export default function MonComptePage() {
  const base = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').trim().replace(/\/$/, '');
  const target = `${base}/mon-compte/`;
  redirect(target);
}


