export const dynamic = 'force-dynamic';

import WpIframeWithFallback from '@/components/WpIframeWithFallback';

export default function WpDashboardPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/page-du-tableau-de-bord/';

  return (
    <WpIframeWithFallback src={iframeSrc} isFullScreen={true} />
  );
}


