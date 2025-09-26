'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import EmailVerificationHelper from '@/components/EmailVerificationHelper';

interface TutorIframeProps {
  slug: string;
  title?: string;
  className?: string;
  height?: string;
}

interface IframeError {
  message: string;
  type: 'loading' | 'frame-options' | 'network' | 'unknown';
}

export default function TutorIframe({ 
  slug, 
  title = 'Tutor LMS', 
  className = '',
  height = '800px'
}: TutorIframeProps) {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IframeError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    let url = `${baseUrl}/${slug}`;

    // Add authentication token if user is logged in
    const token = authService.getToken();
    if (token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}tutor_token=${encodeURIComponent(token)}`;
    }

    // Add iframe parameter to help WordPress detect embedded context
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}iframe=1&embedded=1&no_stats=1&origin=${encodeURIComponent(window.location.origin)}`;

    setIframeUrl(url);
    setIsLoading(false);
  }, [slug]);

  // Listen for postMessage events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      const allowedOrigins = [
        'https://api.helvetiforma.ch',
        'https://helvetiforma.ch',
        process.env.NEXT_PUBLIC_WORDPRESS_URL
      ].filter(Boolean);
      
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'tutor_auth') {
          switch (data.action) {
            case 'login_success':
              setAuthMessage('Connexion réussie! Redirection en cours...');
              if (data.token && data.user) {
                // Store auth data
                localStorage.setItem('tutor_auth_token', data.token);
                localStorage.setItem('tutor_user_data', JSON.stringify(data.user));
                
                // Redirect after a short delay
                setTimeout(() => {
                  window.location.href = '/tableau-de-bord';
                }, 2000);
              }
              break;
              
            case 'login_error':
              setAuthMessage(`Erreur de connexion: ${data.message || 'Identifiants incorrects'}`);
              setTimeout(() => setAuthMessage(null), 5000);
              break;
              
            case 'registration_success':
              setAuthMessage('Inscription réussie!');
              if (data.email) {
                setRegisteredEmail(data.email);
                setShowEmailVerification(true);
              }
              setTimeout(() => setAuthMessage(null), 3000);
              break;
              
            case 'registration_error':
              setAuthMessage(`Erreur d'inscription: ${data.message || 'Erreur inconnue'}`);
              setTimeout(() => setAuthMessage(null), 5000);
              break;
              
            case 'logout':
              setAuthMessage('Déconnexion en cours...');
              localStorage.removeItem('tutor_auth_token');
              localStorage.removeItem('tutor_user_data');
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
              break;
          }
        }
      } catch (e) {
        console.warn('Failed to parse message from iframe:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = (event?: any) => {
    setIsLoading(false);
    
    // Try to determine the type of error
    let errorType: IframeError['type'] = 'unknown';
    let errorMessage = 'Impossible de charger le contenu.';
    
    if (event?.target?.src && event.target.src.includes('api.helvetiforma.ch')) {
      errorType = 'frame-options';
      errorMessage = 'Le contenu ne peut pas être affiché dans un iframe. Cliquez pour ouvrir dans un nouvel onglet.';
    }
    
    setError({
      type: errorType,
      message: errorMessage
    });
    
    console.error('Failed to load Tutor LMS iframe:', slug, event);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a 
              href={iframeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ouvrir dans un nouvel onglet
            </a>
            {retryCount < 3 && (
              <button 
                onClick={handleRetry}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Email verification helper */}
      {showEmailVerification && registeredEmail && (
        <div className="mb-6">
          <EmailVerificationHelper 
            email={registeredEmail}
            onClose={() => setShowEmailVerification(false)}
          />
        </div>
      )}

      {/* Authentication message overlay */}
      {authMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{authMessage}</span>
          </div>
        </div>
      )}
      
      <iframe
        src={iframeUrl}
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="rounded-lg shadow-sm"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      
      {/* Fallback for iframe loading issues */}
      <div className="absolute inset-0 pointer-events-none">
        <noscript>
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <div className="text-center p-6">
              <p className="text-gray-600 mb-4">JavaScript est requis pour afficher ce contenu.</p>
              <a 
                href={iframeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        </noscript>
      </div>
    </div>
  );
}
