'use client';

interface WpEmbeddedIframeProps {
  src: string;
  heightOffsetPx?: number; // space reserved for app header (default ~64px)
}

export default function WpEmbeddedIframe({ src, heightOffsetPx = 64 }: WpEmbeddedIframeProps) {
  return (
    <div className="bg-white">
      <iframe
        src={src}
        className="w-full border-0"
        style={{ height: `calc(100vh - ${heightOffsetPx}px)` }}
        loading="lazy"
      />
    </div>
  );
}


