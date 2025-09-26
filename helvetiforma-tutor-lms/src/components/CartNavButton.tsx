'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartService } from '@/services/cartService';

export default function CartNavButton() {
  const [cartCount, setCartCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initial cart count
    setCartCount(cartService.getItemCount());

    // Subscribe to cart updates
    const unsubscribe = cartService.onCartUpdate((cart) => {
      const newCount = cart.items.length;
      if (newCount > cartCount) {
        // Animate when items are added
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
      setCartCount(newCount);
    });

    return unsubscribe;
  }, [cartCount]);

  const handleCartClick = () => {
    router.push('/panier');
  };

  return (
    <div className="relative">
      <button 
        onClick={handleCartClick}
        className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ${
          isAnimating ? 'scale-110 bg-green-600' : ''
        }`}
        title={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        <span className="hidden sm:inline">Panier</span>
        {cartCount > 0 && (
          <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold transition-all duration-200 ${
            isAnimating ? 'scale-125 bg-green-500' : ''
          }`}>
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
