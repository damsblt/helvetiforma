'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { authService } from '@/services/authService';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface EnhancedCheckoutFlowProps {
  onComplete: (orderData: any) => void;
}

export default function EnhancedCheckoutFlow({ onComplete }: EnhancedCheckoutFlowProps) {
  const { cart, loading } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    postcode: '',
    country: 'CH',
    paymentMethod: 'stripe',
    termsAccepted: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: CheckoutStep[] = [
    { id: 1, title: 'Panier', description: 'Vérifiez vos cours', completed: currentStep > 1 },
    { id: 2, title: 'Informations', description: 'Vos coordonnées', completed: currentStep > 2 },
    { id: 3, title: 'Paiement', description: 'Mode de paiement', completed: currentStep > 3 },
    { id: 4, title: 'Confirmation', description: 'Finalisation', completed: false }
  ];

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (cart.items.length === 0) {
        newErrors.cart = 'Votre panier est vide';
      }
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'L\'email n\'est pas valide';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    }

    if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Veuillez sélectionner un mode de paiement';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsProcessing(true);
    try {
      // Process payment and create order
      await onComplete(formData);
    } catch (error) {
      console.error('Checkout error:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser votre commande</h1>
          <p className="mt-2 text-gray-600">Votre formation vous attend !</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : currentStep === step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? '✓' : step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Cart Review */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Votre panier</h2>
              {cart.items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Votre panier est vide</h3>
                  <p className="text-gray-600 mb-6">Découvrez nos formations et ajoutez des cours à votre panier.</p>
                  <a
                    href="/formations"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir les formations
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">📚</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.course_duration} • {item.course_level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="votre@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+41 XX XXX XX XX"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom de votre entreprise (optionnel)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mode de paiement</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-lg mr-2">💳</span>
                      <div>
                        <p className="font-medium text-gray-900">Carte bancaire</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🅿️</span>
                      <div>
                        <p className="font-medium text-gray-900">PayPal</p>
                        <p className="text-sm text-gray-600">Paiement sécurisé via PayPal</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🏦</span>
                      <div>
                        <p className="font-medium text-gray-900">Virement bancaire</p>
                        <p className="text-sm text-gray-600">Paiement par virement (CHF uniquement)</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-600">
                    J'accepte les{' '}
                    <a href="/cgu" className="text-blue-600 hover:text-blue-800 underline">
                      conditions générales d'utilisation
                    </a>{' '}
                    et la{' '}
                    <a href="/mentions" className="text-blue-600 hover:text-blue-800 underline">
                      politique de confidentialité
                    </a>
                  </span>
                </label>
                {errors.termsAccepted && <p className="mt-1 text-sm text-red-600">{errors.termsAccepted}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande confirmée !</h2>
              <p className="text-gray-600 mb-6">
                Merci pour votre achat. Vous allez recevoir un email de confirmation avec les détails de vos cours.
              </p>
              <div className="space-y-4">
                <a
                  href="/student-dashboard"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accéder à mes cours
                </a>
                <div>
                  <a
                    href="/formations"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Découvrir d'autres formations
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Précédent
            </button>

            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg font-medium ${
                isProcessing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Traitement...
                </span>
              ) : currentStep === 3 ? (
                'Finaliser la commande'
              ) : (
                'Suivant'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
