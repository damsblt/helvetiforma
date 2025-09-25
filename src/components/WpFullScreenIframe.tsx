'use client';

interface WpFullScreenIframeProps {
  src: string;
}

export default function WpFullScreenIframe({ src }: WpFullScreenIframeProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <iframe
        src={src}
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}


