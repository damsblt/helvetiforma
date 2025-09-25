export const dynamic = 'force-dynamic';

import React from 'react';
import WpEmbeddedIframe from '@/components/WpEmbeddedIframe';

export default function WpCourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = React.use(params);
  const slugOrId = resolved.slug;

  // If numeric, Tutor LMS will still resolve via /courses/<id>/
  const iframeSrc = `https://api.helvetiforma.ch/courses/${encodeURIComponent(slugOrId)}/`;

  return (
    <WpEmbeddedIframe src={iframeSrc} />
  );
}


