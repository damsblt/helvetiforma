'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setIsUpdating(productId);
    await updateQuantity(productId, newQuantity);
    setIsUpdating(null);
  };

  const handleRemoveItem = async (productId: number) => {
    setIsUpdating(productId);
    await removeFromCart(productId);
    setIsUpdating(null);
  };

  const handleClearCart = async () => {
    if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
      await clearCart();
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Erreur:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panier</h1>
          <p className="mt-2 text-gray-600">
            {cart.item_count} {cart.item_count === 1 ? 'article' : 'articles'} dans votre panier
          </p>
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart - Optimized for User Journey */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              {/* Empty Cart Icon */}
              <div className="text-gray-400 mb-8">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                </svg>
              </div>
              
              {/* Empty Cart Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
              <p className="text-gray-600 mb-8">
                Découvrez nos formations professionnelles et ajoutez-les à votre panier pour commencer votre apprentissage.
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href="/products"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Voir toutes les formations
                </Link>
                
                <div className="text-sm text-gray-500">
                  ou
                </div>
                
                <Link
                  href="/enroll"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  S'inscrire directement
                </Link>
              </div>
              
              {/* Popular Courses Preview */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Formations populaires</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-medium text-gray-900 text-sm">Gestion des Salaires</h4>
                    <p className="text-xs text-gray-500 mt-1">CHF 1,200</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">🏢</div>
                    <h4 className="font-medium text-gray-900 text-sm">Charges Sociales</h4>
                    <p className="text-xs text-gray-500 mt-1">CHF 980</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="font-medium text-gray-900 text-sm">Impôt à la Source</h4>
                    <p className="text-xs text-gray-500 mt-1">CHF 750</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
                      {cart.items.map((item) => (
                        <li key={item.product_id} className="py-6">
                          <div className="flex items-center space-x-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.name}
                              </h3>
                              <div className="mt-1 text-sm text-gray-500 space-y-1">
                                <p><span className="font-medium">Niveau:</span> {item.course_level}</p>
                                <p><span className="font-medium">Durée:</span> {item.course_duration}</p>
                                <p><span className="font-medium">Prix:</span> {item.price.toFixed(2)} {cart.currency}</p>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                disabled={isUpdating === item.product_id}
                                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <span className="w-8 text-center text-sm font-medium">
                                {isUpdating === item.product_id ? '...' : item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                disabled={isUpdating === item.product_id}
                                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>

                            {/* Price and Remove */}
                            <div className="flex items-center space-x-4">
                              <div className="text-lg font-medium text-gray-900">
                                {(item.price * item.quantity).toFixed(2)} {cart.currency}
                              </div>
                              
                              <button
                                onClick={() => handleRemoveItem(item.product_id)}
                                disabled={isUpdating === item.product_id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Clear Cart Button */}
                  {cart.items.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleClearCart}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Vider le panier
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé de la commande</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-medium">{cart.total.toFixed(2)} {cart.currency}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TVA (8%)</span>
                      <span className="font-medium">{(cart.total * 0.08).toFixed(2)} {cart.currency}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{(cart.total * 1.08).toFixed(2)} {cart.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/checkout"
                      className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Commander
                    </Link>
                  </div>

                  {/* Security Info */}
                  <div className="mt-6 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Paiement sécurisé SSL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
