'use client';

import React, { useState, useEffect } from 'react';

interface Subscription {
  id: number;
  name: string;
  description: string;
  price: string;
  billing_cycle: string;
  status: string;
  features: string[];
}

interface SubscriptionEnrollmentProps {
  studentId: number;
  onEnrollmentComplete?: (subscription: Subscription) => void;
}

export default function SubscriptionEnrollment({ studentId, onEnrollmentComplete }: SubscriptionEnrollmentProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions');
      const result = await response.json();
      
      if (result.success) {
        setSubscriptions(result.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSelect = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubscription) return;

    try {
      setEnrolling(true);
      
      // In a real app, you would integrate with a payment processor like Stripe
      // For now, we'll simulate the enrollment
      const enrollmentData = {
        student_id: studentId,
        subscription_id: selectedSubscription.id,
        payment_data: paymentData,
        status: 'active'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Subscription enrollment:', enrollmentData);
      
      if (onEnrollmentComplete) {
        onEnrollmentComplete(selectedSubscription);
      }
      
      // Reset form
      setShowPaymentForm(false);
      setSelectedSubscription(null);
      setPaymentData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });
      
    } catch (error) {
      console.error('Error enrolling in subscription:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl font-semibold text-gray-700">Chargement des abonnements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Choisissez votre Abonnement</h1>
        
        {!showPaymentForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white shadow rounded-lg p-6 relative">
                {subscription.status === 'popular' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-full">
                      Populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{subscription.name}</h3>
                  <p className="text-gray-600 mb-4">{subscription.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">{subscription.price}</span>
                    <span className="text-gray-500 ml-2">/{subscription.billing_cycle}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités incluses:</h4>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscriptionSelect(subscription)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    subscription.status === 'popular'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  Choisir cet abonnement
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Finaliser votre Abonnement</h2>
              
              {selectedSubscription && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900">{selectedSubscription.name}</h3>
                  <p className="text-gray-600">{selectedSubscription.description}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-blue-600">{selectedSubscription.price}</span>
                    <span className="text-gray-500 ml-2">/{selectedSubscription.billing_cycle}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Informations de Paiement
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardholderName}
                        onChange={(e) => setPaymentData({...paymentData, cardholderName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/AA"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Retour
                  </button>
                  
                  <button
                    type="submit"
                    disabled={enrolling}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'En cours...' : 'Confirmer l\'abonnement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
