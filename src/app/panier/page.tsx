'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cartService, Cart } from '@/services/cartService';
import { authService } from '@/services/authService';

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, currency: 'CHF' });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();

    // Subscribe to cart updates
    const unsubscribe = cartService.onCartUpdate((updatedCart) => {
      setCart(updatedCart);
    });

    return unsubscribe;
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentCart = cartService.getCart();
      setCart(currentCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Erreur lors du chargement du panier');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (courseId: number) => {
    cartService.removeFromCart(courseId);
  };

  const proceedToCheckout = async () => {
    if (cart.items.length === 0) return;

    setIsProcessing(true);
    try {
      // Check if user is logged in
      const user = authService.getUser();
      if (!user) {
        // Store cart in sessionStorage for after registration
        sessionStorage.setItem('pending_cart', JSON.stringify(cart));
        
        // Redirect to registration with return URL
        router.push('/inscription-des-apprenants?return_to=checkout');
        return;
      }

      // User is logged in, proceed to checkout/payment
      router.push('/validation-de-la-commande');
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Erreur lors du traitement de la commande');
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
          <p className="mt-4 text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Panier</h1>
            {cart.items.length > 0 && (
              <p className="text-gray-600 mt-1">
                {cart.items.length} article{cart.items.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
                <p className="text-gray-600 mb-6">Découvrez nos formations et ajoutez-les à votre panier</p>
                <Link
                  href="/formations"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir les formations
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.course_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        {item.featured_image && (
                          <img
                            src={item.featured_image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-sm">Formation en ligne</p>
                          <Link
                            href={`/courses/${item.course_id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm underline"
                          >
                            Voir les détails
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {item.sale_price && (
                            <span className="text-gray-500 line-through text-sm block">
                              {formatPrice(item.price)}
                            </span>
                          )}
                          <span className="font-semibold text-lg">
                            {formatPrice(item.sale_price || item.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.course_id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer du panier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-medium">{formatPrice(cart.total)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">TVA (incluse):</span>
                      <span className="font-medium">Incluse</span>
                    </div>
                    <hr className="my-2 border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(cart.total)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/formations"
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium"
                    >
                      ← Continuer mes achats
                    </Link>
                    <button
                      onClick={proceedToCheckout}
                      disabled={isProcessing || cart.items.length === 0}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isProcessing ? 'Traitement...' : '🚀 Passer la commande'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Security & Trust Indicators */}
        {cart.items.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Accès immédiat</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Garantie 30 jours</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}