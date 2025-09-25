export const dynamic = 'force-dynamic';

import WpEmbeddedIframe from '@/components/WpEmbeddedIframe';

export default function WpStudentRegistrationPage() {
  const iframeSrc = 'https://api.helvetiforma.ch/tableau-de-bord/inscription-des-apprenants/';

  return (
    <WpEmbeddedIframe src={iframeSrc} />
  );
}


