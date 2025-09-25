export const dynamic = 'force-dynamic';

import WpFullScreenIframe from '@/components/WpFullScreenIframe';

export default function WpDashboardPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/page-du-tableau-de-bord/';

  return (
    <WpFullScreenIframe src={iframeSrc} />
  );
}


