export const dynamic = 'force-dynamic';

import WpFullScreenIframe from '@/components/WpFullScreenIframe';

export default function WpCourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = React.use(params);
  const slugOrId = resolved.slug;

  // If numeric, Tutor LMS will still resolve via /courses/<id>/
  const iframeSrc = `https://api.helvetiforma.ch/courses/${encodeURIComponent(slugOrId)}/`;

  return (
    <WpFullScreenIframe src={iframeSrc} />
  );
}


