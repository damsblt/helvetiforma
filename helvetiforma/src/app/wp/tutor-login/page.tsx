export const dynamic = 'force-dynamic';

import WpEmbeddedIframe from '@/components/WpEmbeddedIframe';

export default function WpTutorLoginPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/tutor-login/';

  return (
    <WpEmbeddedIframe src={iframeSrc} />
  );
}


