export const dynamic = 'force-dynamic';

import WpFullScreenIframe from '@/components/WpFullScreenIframe';

export default function WpStudentRegistrationPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/tableau-de-bord/inscription-des-apprenants/';

  return (
    <WpFullScreenIframe src={iframeSrc} />
  );
}


