'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';

interface CartIconProps {
  className?: string;
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ className = '', onClick }) => {
  const { cart, isOpen } = useCart();
  const itemCount = cart.item_count || 0;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      aria-label={`Panier (${itemCount} articles)`}
    >
      {/* Shopping Cart Icon */}
      <svg
        className={`w-6 h-6 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M17 18a2 2 0 100 4 2 2 0 000-4zM9 18a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      
      {/* Item Count Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      
      {/* Cart Open Indicator */}
      {isOpen && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
      )}
    </button>
  );
};

export default CartIcon;
