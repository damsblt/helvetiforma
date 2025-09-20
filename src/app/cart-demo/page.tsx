'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

const CartDemoPage: React.FC = () => {
  const { addToCart, cart, isOpen, toggleCart, openCart, closeCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testAddToCart = async (productId: number, productName: string) => {
    setLoading(true);
    setResult('');
    
    try {
      await addToCart(productId, 1);
      setResult(`✅ ${productName} ajouté au panier ! Le panier devrait s'ouvrir automatiquement.`);
    } catch (error) {
      setResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Démonstration du Panier</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cart Controls */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Contrôles du Panier</h2>
          
          <div className="space-y-2">
            <button
              onClick={toggleCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isOpen ? 'Fermer le Panier' : 'Ouvrir le Panier'}
            </button>
            
            <button
              onClick={openCart}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Ouvrir le Panier
            </button>
            
            <button
              onClick={closeCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Fermer le Panier
            </button>
          </div>
        </div>

        {/* Test Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Produits de Test</h2>
          
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">Formation Complète 888</h3>
              <p className="text-sm text-gray-600">ID: 120 - Prix: 1500 CHF</p>
              <button
                onClick={() => testAddToCart(120, 'Formation Complète 888')}
                disabled={loading}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Ajout...' : 'Ajouter au Panier'}
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">Formation Test 999</h3>
              <p className="text-sm text-gray-600">ID: 119 - Prix: 1200 CHF</p>
              <button
                onClick={() => testAddToCart(119, 'Formation Test 999')}
                disabled={loading}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Ajout...' : 'Ajouter au Panier'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">État du Panier</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Articles:</span>
            <span className="ml-2 text-gray-900">{cart.item_count}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Total:</span>
            <span className="ml-2 text-gray-900">{cart.total.toFixed(2)} {cart.currency}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Ouvert:</span>
            <span className={`ml-2 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {isOpen ? 'Oui' : 'Non'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Chargement:</span>
            <span className={`ml-2 ${loading ? 'text-yellow-600' : 'text-gray-600'}`}>
              {loading ? 'Oui' : 'Non'}
            </span>
          </div>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{result}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• Cliquez sur "Ajouter au Panier" pour tester l'ajout automatique</li>
          <li>• Le panier devrait s'ouvrir automatiquement après l'ajout</li>
          <li>• Utilisez les contrôles pour ouvrir/fermer le panier manuellement</li>
          <li>• Le compteur d'articles s'affiche sur l'icône du panier dans la navigation</li>
          <li>• Le panier est accessible via l'icône dans la barre de navigation</li>
        </ul>
      </div>
    </div>
  );
};

export default CartDemoPage;
