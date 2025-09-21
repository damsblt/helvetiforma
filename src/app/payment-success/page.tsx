'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    
    if (paymentIntent && redirectStatus === 'succeeded') {
      setPaymentDetails({
        paymentIntent,
        status: redirectStatus,
        timestamp: new Date().toISOString()
      });
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paiement non trouvé</h1>
          <p className="text-gray-600 mb-6">Nous n'avons pas pu vérifier votre paiement.</p>
          <Link 
            href="/checkout" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au paiement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi ! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Votre paiement a été traité avec succès
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Détails du paiement
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID de transaction:</span>
              <span className="font-mono text-sm text-gray-900">
                {paymentDetails.paymentIntent}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className="text-green-600 font-semibold">
                ✅ Confirmé
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">
                {new Date(paymentDetails.timestamp).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Prochaines étapes
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Email de confirmation</h3>
                <p className="text-blue-700 text-sm">
                  Un email de confirmation a été envoyé à votre adresse email avec vos identifiants de connexion.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <UserIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Accès aux formations</h3>
                <p className="text-blue-700 text-sm">
                  Votre compte a été créé et vous avez été automatiquement inscrit aux formations achetées.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Se connecter à mon compte
          </Link>
          <Link 
            href="/formations" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            Voir mes formations
          </Link>
          <Link 
            href="/" 
            className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center"
          >
            Retour à l'accueil
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Besoin d'aide ? Contactez-nous à{' '}
            <a href="mailto:support@helvetiforma.ch" className="text-blue-600 hover:underline">
              support@helvetiforma.ch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
