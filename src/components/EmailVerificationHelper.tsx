'use client';

import { useState } from 'react';

interface EmailVerificationHelperProps {
  email?: string;
  onClose?: () => void;
}

export default function EmailVerificationHelper({ email, onClose }: EmailVerificationHelperProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch('/api/tutor/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResendMessage('Email de vérification renvoyé avec succès!');
      } else {
        setResendMessage('Erreur lors du renvoi de l\'email. Veuillez contacter le support.');
      }
    } catch (error) {
      setResendMessage('Erreur de connexion. Veuillez réessayer plus tard.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white border border-green-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Inscription réussie !
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Un email de vérification a été envoyé à <strong>{email}</strong>. 
                Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Renvoyer l'email
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-green-700 hover:text-green-600"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Problèmes avec l'email ?
              </button>
            </div>

            {resendMessage && (
              <div className={`mt-3 p-3 rounded-md ${
                resendMessage.includes('succès') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {resendMessage}
              </div>
            )}

            {/* Troubleshooting section */}
            {showTroubleshooting && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  L'email n'arrive pas ? Voici quoi faire :
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>
                    <span>Vérifiez votre dossier spam/courrier indésirable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>
                    <span>Attendez quelques minutes, les emails peuvent prendre du temps</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>
                    <span>Vérifiez que l'adresse email est correcte</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">4.</span>
                    <span>Contactez-nous à <a href="mailto:support@helvetiforma.ch" className="underline">support@helvetiforma.ch</a> si le problème persiste</span>
                  </li>
                </ul>
                
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note :</strong> Vous pouvez commencer à explorer nos formations dès maintenant. 
                    La vérification email est requise uniquement pour certaines fonctionnalités avancées.
                  </p>
                  <div className="mt-2">
                    <a 
                      href="/formations" 
                      className="inline-flex items-center text-sm font-medium text-yellow-700 hover:text-yellow-600"
                    >
                      Voir nos formations
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onClose}
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
