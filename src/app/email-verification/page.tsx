'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TutorIframe from '@/components/tutor/TutorIframe';

export default function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    // Extraire les paramètres de l'URL
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    const keyParam = searchParams.get('key'); // WordPress utilise parfois 'key' au lieu de 'token'
    const actionParam = searchParams.get('action');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (tokenParam || keyParam) {
      setToken(tokenParam || keyParam || '');
      setVerificationStatus('processing');
      setShowIframe(true);
    } else if (actionParam === 'verify' || emailParam) {
      // Si on a juste un email ou une action de vérification
      setVerificationStatus('processing');
      setShowIframe(true);
    } else {
      setVerificationStatus('error');
      setMessage('Lien de vérification invalide. Veuillez vérifier votre email ou demander un nouveau lien.');
    }
  }, [searchParams]);

  // Gérer les messages de l'iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine pour la sécurité
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
        
        if (data.type === 'email_verification') {
          switch (data.action) {
            case 'verification_success':
              setVerificationStatus('success');
              setMessage('Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.');
              setTimeout(() => {
                router.push('/tutor-login');
              }, 3000);
              break;
              
            case 'verification_error':
              setVerificationStatus('error');
              setMessage(data.message || 'Erreur lors de la vérification de votre email.');
              break;
              
            case 'already_verified':
              setVerificationStatus('success');
              setMessage('Votre email est déjà vérifié ! Vous pouvez vous connecter.');
              setTimeout(() => {
                router.push('/tutor-login');
              }, 2000);
              break;
          }
        }
      } catch (e) {
        console.warn('Failed to parse message from iframe:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  const buildVerificationUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    let url = baseUrl;
    
    // Construire l'URL de vérification WordPress
    const params = new URLSearchParams();
    
    if (email) params.append('email', email);
    if (token) params.append('token', token);
    
    // Ajouter les paramètres d'iframe
    params.append('iframe', '1');
    params.append('embedded', '1');
    params.append('no_stats', '1');
    params.append('origin', window.location.origin);
    
    return `${url}?${params.toString()}`;
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement...</h2>
          <p className="text-gray-600">Préparation de la vérification de votre email</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email vérifié !</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/tutor-login')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter maintenant
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de vérification</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/inscription-des-apprenants')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un nouveau compte
            </button>
            <button
              onClick={() => router.push('/tutor-login')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Essayer de se connecter
            </button>
            <a
              href="mailto:support@helvetiforma.ch?subject=Problème de vérification email"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Contacter le support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // État 'processing' - Afficher l'iframe
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Vérification de votre email
          </h1>
          <p className="text-lg text-gray-600">
            {email ? `Vérification en cours pour ${email}` : 'Vérification de votre adresse email en cours...'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {showIframe ? (
            <iframe
              src={buildVerificationUrl()}
              title="Vérification Email HelvetiForma"
              width="100%"
              height="600px"
              frameBorder="0"
              className="rounded-lg"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
              onLoad={() => {
                // L'iframe est chargée, on peut masquer le loading si nécessaire
                console.log('Email verification iframe loaded');
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Préparation de la vérification...</p>
              </div>
            </div>
          )}
        </div>

        {/* Section d'aide */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Problème avec la vérification ?
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• Le lien de vérification peut expirer après 24 heures</p>
            <p>• Vérifiez que vous utilisez le lien le plus récent de votre email</p>
            <p>• Si le problème persiste, contactez-nous à support@helvetiforma.ch</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/inscription-des-apprenants')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Créer un nouveau compte →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
