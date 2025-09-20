'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { wooCommerceCartService } from '@/services/woocommerceCartService';
import { authService } from '@/services/authService';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  paymentMethod: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutForm() {
  const { cart, loading, error } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    paymentMethod: 'stripe' // Default to Stripe
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isStripeSelected, setIsStripeSelected] = useState(true); // Default to Stripe selected

  // Load user data if authenticated
  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.firstName.trim()) errors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) errors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }
    if (!formData.paymentMethod) errors.paymentMethod = 'Veuillez sélectionner un mode de paiement';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Check if Stripe is selected
    if (name === 'paymentMethod') {
      setIsStripeSelected(value === 'stripe');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setOrderError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsProcessing(true);
    setOrderError('');

    try {
      let paymentSuccess = false;
      const paymentIntentId = null;

      // Step 1: Process payment first
      if (formData.paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          throw new Error("Stripe n'est pas initialisé.");
        }

        // Confirm payment with PaymentElement
        const { error: confirmError } = await stripe.confirmPayment({
          elements: elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout?payment_success=true`,
          },
        });

        if (confirmError) {
          throw new Error(confirmError.message || 'Erreur lors de la confirmation du paiement.');
        }

        // Payment was successful
        paymentSuccess = true;
        console.log('Payment successful');
      } else {
        // For non-Stripe payment methods, assume success for now
        paymentSuccess = true;
      }

      if (!paymentSuccess) {
        throw new Error('Le paiement a échoué.');
      }

      // Step 2: Create WordPress user and enroll in courses (only after successful payment)
      console.log('Creating WordPress user and enrolling in courses...');
      const enrollmentResponse = await fetch('/api/tutor-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          course_ids: cart.items.map(item => item.course_id).filter(Boolean)
        }),
      });

      const enrollmentResult = await enrollmentResponse.json();
      
      if (!enrollmentResult.success) {
        throw new Error(enrollmentResult.error || 'Erreur lors de la création du compte utilisateur');
      }

      console.log('User created and enrolled:', enrollmentResult);

      // Step 3: Create WooCommerce order (only after successful payment)
      console.log('Creating WooCommerce order...');
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        payment_method: formData.paymentMethod,
        transaction_id: paymentIntentId,
        // Default values for required WooCommerce fields
        address: 'Non spécifié',
        city: 'Non spécifié',
        state: 'Non spécifié',
        postcode: '0000',
        country: 'CH',
        phone: '',
        company: ''
      };
      const order = await wooCommerceCartService.createOrder(cart, orderData);
      
      if (order) {
        setOrderSuccess(true);
        await wooCommerceCartService.clearCart();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setOrderError(error instanceof Error ? error.message : 'Erreur lors du processus de commande. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed unused payment method functions since we only use Stripe

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Ajoutez des formations à votre panier avant de passer commande.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Voir les formations
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Commande confirmée !
            </h2>
            <p className="text-gray-600 mb-8">
              Votre commande a été créée avec succès. Vous recevrez un email de confirmation sous peu.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/student-dashboard"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Accéder à mes cours
            </Link>
            <Link
              href="/products"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser votre commande</h1>
          <p className="mt-2 text-gray-600">Remplissez vos informations pour compléter votre inscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
              </div>
              <h2 className="ml-3 text-xl font-bold text-gray-900">Informations personnelles</h2>
            </div>
            
            {orderError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {orderError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>



              {/* Payment Method Selection */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                  </div>
                  <h3 className="ml-3 text-xl font-bold text-gray-900">Paiement</h3>
                </div>

                {/* Only show Stripe payment method */}
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="radio"
                      id="stripe"
                      name="paymentMethod"
                      value="stripe"
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="stripe"
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.paymentMethod === 'stripe'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          💳
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            Carte de crédit/débit
                          </div>
                          <div className="text-sm text-gray-500">
                            Paiement sécurisé par carte de crédit/débit
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.paymentMethod === 'stripe'
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'stripe' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {formErrors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.paymentMethod}</p>
                )}

                {/* Stripe PaymentElement */}
                {formData.paymentMethod === 'stripe' && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Informations de paiement
                    </label>
                    <PaymentElement />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Traitement en cours...
                    </div>
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>
                
                <p className="mt-3 text-xs text-gray-500 text-center">
                  En confirmant votre commande, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Résumé de la commande</h2>
            
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.total.toFixed(2)} {cart.currency}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{cart.total.toFixed(2)} {cart.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (8%)</span>
                  <span className="font-medium">{(cart.total * 0.08).toFixed(2)} {cart.currency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{(cart.total * 1.08).toFixed(2)} {cart.currency}</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Paiement sécurisé
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Vos informations sont protégées par un chiffrement SSL 256-bit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

             {/* Help Section */}
             <div className="mt-6">
               <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                 <h3 className="text-sm font-medium text-blue-800 mb-2">
                   Besoin d'aide ?
                 </h3>
                 <div className="text-sm text-blue-700">
                   <p>📧 contact@helvetiforma.ch</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}