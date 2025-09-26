'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthWrapper from '@/components/tutor/AuthWrapper';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handlePayment = async (method: string) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      alert(`Paiement ${method} simulé avec succès! En production, ceci intégrerait un vrai processeur de paiement.`);
      router.push('/tableau-de-bord');
    }, 2000);
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finaliser votre achat
            </h1>
            <p className="text-gray-600">
              Choisissez votre méthode de paiement préférée
            </p>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Méthodes de paiement
              </h2>
              
              {/* Payment Methods */}
              <div className="space-y-4">
                {/* Stripe */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-sm font-medium text-gray-900">Carte de crédit</span>
                      <div className="ml-2 flex space-x-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">MC</span>
                      </div>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Paiement sécurisé via Stripe
                  </p>
                </div>

                {/* PayPal */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">PayPal</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Payez avec votre compte PayPal
                  </p>
                </div>

                {/* Bank Transfer */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Virement bancaire</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Paiement par virement SEPA
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé de la commande</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cours</span>
                  <span className="text-sm font-medium">Formation sélectionnée</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Prix</span>
                  <span className="text-sm font-medium">À déterminer</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">CHF 0.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={() => handlePayment(paymentMethod)}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Traitement en cours...' : 'Finaliser le paiement'}
            </button>

            {/* Development Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Mode développement</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Cette page de paiement est une simulation. En production, elle intégrerait 
                      des processeurs de paiement réels comme Stripe, PayPal, ou des solutions bancaires suisses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link href="/formations" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Retour aux formations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
