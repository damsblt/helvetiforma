export const dynamic = 'force-dynamic';

import WpFullScreenIframe from '@/components/WpFullScreenIframe';

export default function WpTutorLoginPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/tutor-login/';

  return (
    <WpFullScreenIframe src={iframeSrc} />
  );
}


