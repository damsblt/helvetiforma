export const dynamic = 'force-dynamic';

import WpFullScreenIframe from '@/components/WpFullScreenIframe';

export default function WpCartPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/panier/';

  return (
    <WpFullScreenIframe src={iframeSrc} />
  );
}


