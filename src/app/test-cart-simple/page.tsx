'use client';

import React, { useState } from 'react';

const TestCartSimplePage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAddToCart = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: 120, quantity: 1 }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Success: ${data.message}\nProduct: ${data.data.name}\nPrice: ${data.data.price} CHF`);
      } else {
        setResult(`❌ Error: ${data.message || data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Cart Functionality</h1>
      
      <div className="space-y-4">
        <button
          onClick={testAddToCart}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Add to Cart (Product ID: 120)'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCartSimplePage;
