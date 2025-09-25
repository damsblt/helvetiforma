export const dynamic = 'force-dynamic';

import WpFullScreenIframe from '@/components/WpFullScreenIframe';

export default function WpCoursesIndexPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/courses/';

  return (
    <WpFullScreenIframe src={iframeSrc} />
  );
}


