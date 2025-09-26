'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartService } from '@/services/cartService';

export default function CartNavButton() {
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Initial cart count
    setCartCount(cartService.getItemCount());

    // Subscribe to cart updates
    const unsubscribe = cartService.onCartUpdate((cart) => {
      setCartCount(cart.items.length);
    });

    return unsubscribe;
  }, []);

  const handleCartClick = () => {
    router.push('/panier');
  };

  return (
    <div className="relative">
      <button 
        onClick={handleCartClick}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <span>🛒</span>
        <span>Panier</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
