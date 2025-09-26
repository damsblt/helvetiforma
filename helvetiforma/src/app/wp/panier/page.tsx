export const dynamic = 'force-dynamic';

import WpEmbeddedIframe from '@/components/WpEmbeddedIframe';

export default function WpCartPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/panier/';

  return (
    <WpEmbeddedIframe src={iframeSrc} />
  );
}


