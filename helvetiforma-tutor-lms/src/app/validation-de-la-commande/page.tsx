'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/tutor/AuthWrapper';
import { cartService, Cart } from '@/services/cartService';
import { authService } from '@/services/authService';
import { orderService, CheckoutData, OrderResponse } from '@/services/orderService';
import type { BillingInfo, PaymentMethod, TutorUser } from '@/types/tutor';

function CheckoutPageContent() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, currency: 'CHF' });
  const [user, setUser] = useState<TutorUser | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    country: 'CH',
    state: '',
    city: '',
    postalCode: '',
    address: '',
    phone: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('stripe');
  const [paymentMethods] = useState<PaymentMethod[]>(orderService.getPaymentMethods());
  const [countries] = useState(orderService.getCountries());
  const [swissStates] = useState(orderService.getSwissStates());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'billing' | 'payment' | 'processing'>('billing');
  const [errors, setErrors] = useState<string[]>([]);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    try {
      const currentCart = cartService.getCart();
      const currentUser = authService.getUser();

      if (!currentUser) {
        router.push('/inscription-des-apprenants?return_to=checkout');
        return;
      }

      if (currentCart.items.length === 0) {
        router.push('/panier');
        return;
      }

      setCart(currentCart);
      setUser(currentUser);

      // Pre-fill billing info with user data
      setBillingInfo(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      }));

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      setErrors(['Erreur lors du chargement des données']);
      setIsLoading(false);
    }
  };

  const handleBillingInfoChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateAndProceed = () => {
    const validation = orderService.validateBillingInfo(billingInfo);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setCurrentStep('payment');
    setErrors([]);
  };

  const processOrder = async () => {
    if (!user) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setErrors([]);

    try {
      const checkoutData: CheckoutData = {
        billingInfo,
        paymentMethod: selectedPaymentMethod,
        cart,
        userId: user.id
      };

      const orderResult: OrderResponse = await orderService.createOrder(checkoutData);

      if (!orderResult.success) {
        setErrors([orderResult.message]);
        setCurrentStep('payment');
        setIsProcessing(false);
        return;
      }

      setOrderData(orderResult);

      // If payment is required, process it
      if (orderResult.payment_required && orderResult.order) {
        const paymentResult = await orderService.processPayment(
          orderResult.order.id,
          selectedPaymentMethod
        );

        if (paymentResult.success) {
          // Success - redirect to dashboard or success page
          router.push(paymentResult.redirect_url || '/tableau-de-bord');
        } else {
          setErrors([paymentResult.message]);
          setCurrentStep('payment');
        }
      } else {
        // No payment required (free courses)
        router.push(orderResult.redirect_url || '/tableau-de-bord');
      }

    } catch (error) {
      console.error('Order processing error:', error);
      setErrors(['Erreur lors du traitement de la commande']);
      setCurrentStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Validation de la commande
          </h1>
          <p className="text-lg text-gray-600">
            Finalisez votre achat et accédez immédiatement à vos formations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            <div className={`flex items-center ${currentStep === 'billing' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'processing' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep === 'billing' ? 'border-blue-600 bg-blue-50 shadow-md' : currentStep === 'payment' || currentStep === 'processing' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {currentStep === 'payment' || currentStep === 'processing' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">1</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="font-medium">Informations</div>
                <div className="text-xs text-gray-500">Données de facturation</div>
              </div>
            </div>
            
            <div className={`w-12 md:w-16 h-0.5 transition-all duration-500 ${currentStep === 'payment' || currentStep === 'processing' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'processing' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep === 'payment' ? 'border-blue-600 bg-blue-50 shadow-md' : currentStep === 'processing' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {currentStep === 'processing' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="font-medium">Paiement</div>
                <div className="text-xs text-gray-500">Finalisation</div>
              </div>
            </div>

            <div className={`w-12 md:w-16 h-0.5 transition-all duration-500 ${currentStep === 'processing' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${currentStep === 'processing' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep === 'processing' ? 'border-green-600 bg-green-50 shadow-md' : 'border-gray-300'}`}>
                {currentStep === 'processing' ? (
                  <svg className="animate-spin w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">3</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="font-medium">Confirmation</div>
                <div className="text-xs text-gray-500">Traitement</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Veuillez corriger les erreurs suivantes :
                        </h3>
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Information Step */}
              {currentStep === 'billing' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de facturation</h2>
                  
                  {/* Already have an account */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          Connecté en tant que <strong>{user?.email}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          authService.logout();
                          router.push('/inscription-des-apprenants?return_to=checkout');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Se connecter avec un autre compte
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={billingInfo.firstName}
                        onChange={(e) => handleBillingInfoChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de famille *
                      </label>
                      <input
                        type="text"
                        value={billingInfo.lastName}
                        onChange={(e) => handleBillingInfoChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Votre nom de famille"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse e-mail *
                      </label>
                      <input
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays *
                      </label>
                      <select
                        value={billingInfo.country}
                        onChange={(e) => handleBillingInfoChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {billingInfo.country === 'CH' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Canton
                        </label>
                        <select
                          value={billingInfo.state || ''}
                          onChange={(e) => handleBillingInfoChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner un canton</option>
                          {swissStates.map(state => (
                            <option key={state.code} value={state.code}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={billingInfo.city}
                        onChange={(e) => handleBillingInfoChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Votre ville"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        value={billingInfo.postalCode}
                        onChange={(e) => handleBillingInfoChange('postalCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Code postal"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        value={billingInfo.address}
                        onChange={(e) => handleBillingInfoChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Rue et numéro"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={billingInfo.phone || ''}
                        onChange={(e) => handleBillingInfoChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+41 XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={validateAndProceed}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continuer vers le paiement →
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Method Step */}
              {currentStep === 'payment' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Méthode de paiement</h2>
                    <button
                      onClick={() => setCurrentStep('billing')}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      ← Modifier les informations
                    </button>
                  </div>

                  <div className="space-y-4">
                    {paymentMethods.filter(method => method.enabled).map((method) => (
                      <label
                        key={method.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setCurrentStep('billing')}
                      className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={processOrder}
                      disabled={isProcessing}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Traitement...' : `Finaliser la commande - ${formatPrice(cart.total)}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Step */}
              {currentStep === 'processing' && (
                <div className="p-6 text-center">
                  <div className="mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Traitement de votre commande...
                  </h2>
                  <p className="text-gray-600">
                    Veuillez patienter pendant que nous traitons votre paiement
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Résumé de la commande
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.course_id} className="flex items-start space-x-3">
                    {item.featured_image && (
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">Formation en ligne</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.sale_price || item.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Sous-total</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>TVA (incluse)</span>
                  <span>Incluse</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Paiement SSL sécurisé</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Accès immédiat aux formations</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Garantie satisfaction 30 jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <Suspense fallback={<LoadingFallback />}>
        <CheckoutPageContent />
      </Suspense>
    </AuthWrapper>
  );
}

