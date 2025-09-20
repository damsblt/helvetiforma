'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function TestCartDebugPage() {
  const { addToCart } = useCart();
  const [productId, setProductId] = useState('120');
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    try {
      setError(null);
      setResult(null);
      
      console.log('Testing cart with:', { productId: parseInt(productId), quantity });
      
      const cart = await addToCart(parseInt(productId), quantity);
      setResult(cart);
      console.log('Cart result:', cart);
    } catch (err) {
      console.error('Cart test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testApiDirectly = async () => {
    try {
      setError(null);
      setResult(null);
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: parseInt(productId), quantity }),
      });
      
      const data = await response.json();
      console.log('Direct API response:', data);
      setResult(data);
    } catch (err) {
      console.error('Direct API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Cart Debug Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Product ID:
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Quantity:
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        
        <div className="space-x-4">
          <button
            onClick={handleTest}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Cart Service
          </button>
          
          <button
            onClick={testApiDirectly}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test API Directly
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Result:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
