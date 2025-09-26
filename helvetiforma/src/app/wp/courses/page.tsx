export const dynamic = 'force-dynamic';

import WpEmbeddedIframe from '@/components/WpEmbeddedIframe';

export default function WpCoursesIndexPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/courses/';

  return (
    <WpEmbeddedIframe src={iframeSrc} />
  );
}


