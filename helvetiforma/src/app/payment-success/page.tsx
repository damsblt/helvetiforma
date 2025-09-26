'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
// Using simple SVG icons instead of heroicons

function PaymentSuccessContent() {
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
      
      // Process account creation and course enrollment
      processAccountCreation(paymentIntent);
    }
    setIsLoading(false);
  }, [searchParams]);

  const processAccountCreation = async (paymentIntent: string) => {
    try {
      console.log('=== ACCOUNT CREATION DEBUG ===');
      console.log('Payment Intent:', paymentIntent);
      
      // Get cart data from localStorage (if available)
      const cartData = localStorage.getItem('cart');
      console.log('Cart data from localStorage:', cartData);
      
      if (!cartData) {
        console.log('❌ No cart data found, skipping account creation');
        return;
      }

      const cart = JSON.parse(cartData);
      console.log('Parsed cart:', cart);
      
      if (!cart.items || cart.items.length === 0) {
        console.log('❌ No cart items found, skipping account creation');
        return;
      }

      // Get user data from localStorage (if available)
      const userData = localStorage.getItem('checkoutFormData');
      console.log('User data from localStorage:', userData);
      
      if (!userData) {
        console.log('❌ No user data found, skipping account creation');
        return;
      }

      const formData = JSON.parse(userData);
      console.log('Parsed form data:', formData);
      
      console.log('✅ Processing complete payment flow for payment:', paymentIntent);
      
      // Use the new comprehensive payment success API
      const paymentSuccessData = {
        paymentIntentId: paymentIntent,
        cartData: cart,
        userData: formData
      };
      
      console.log('Sending payment success data:', paymentSuccessData);
      
      const paymentResponse = await fetch('/api/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentSuccessData),
      });

      console.log('Payment success response status:', paymentResponse.status);
      const paymentResult = await paymentResponse.json();
      console.log('Payment success result:', paymentResult);
      
      if (paymentResult.success) {
        console.log('✅ Complete payment flow successful:', paymentResult);
        // Clear cart and form data after successful processing
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutFormData');
      } else {
        console.error('❌ Payment processing failed:', paymentResult.error);
      }
    } catch (error) {
      console.error('❌ Error processing account creation:', error);
    }
  };

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
          <div className="mx-auto h-16 w-16 text-green-500 mb-4 flex items-center justify-center">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
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
              <div className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Email de confirmation</h3>
                <p className="text-blue-700 text-sm">
                  Un email de confirmation a été envoyé à votre adresse email avec vos identifiants de connexion.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
