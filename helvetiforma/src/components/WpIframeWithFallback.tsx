'use client';

import { useState, useEffect } from 'react';

interface WpIframeWithFallbackProps {
  src: string;
  heightOffsetPx?: number;
  isFullScreen?: boolean;
}

export default function WpIframeWithFallback({ 
  src, 
  heightOffsetPx = 64, 
  isFullScreen = false 
}: WpIframeWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test if the iframe source is accessible
    const testFrame = document.createElement('iframe');
    testFrame.style.display = 'none';
    testFrame.src = src;
    
    const timeout = setTimeout(() => {
      setHasError(true);
      setIsLoading(false);
      document.body.removeChild(testFrame);
    }, 5000);

    testFrame.onload = () => {
      clearTimeout(timeout);
      setIsLoading(false);
      document.body.removeChild(testFrame);
    };

    testFrame.onerror = () => {
      clearTimeout(timeout);
      setHasError(true);
      setIsLoading(false);
      document.body.removeChild(testFrame);
    };

    document.body.appendChild(testFrame);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(testFrame)) {
        document.body.removeChild(testFrame);
      }
    };
  }, [src]);

  const containerClass = isFullScreen 
    ? "fixed inset-0 z-50 bg-white" 
    : "bg-white";

  const iframeStyle = isFullScreen 
    ? { width: '100%', height: '100%' }
    : { height: `calc(100vh - ${heightOffsetPx}px)` };

  if (hasError) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Unavailable</h3>
            <p className="text-gray-500 mb-4">
              The content cannot be displayed due to security restrictions or blocking software.
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Open in New Tab
              <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <iframe
        src={src}
        className="w-full border-0"
        style={iframeStyle}
        loading="lazy"
        allow="payment *; fullscreen *; camera *; microphone *; geolocation *"
        referrerPolicy="origin-when-cross-origin"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

