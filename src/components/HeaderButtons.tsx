'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartIcon from './CartIcon';
import CartDropdown from './CartDropdown';

export default function HeaderButtons() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleCart } = useCart();

  useEffect(() => {
    // Check for user in localStorage
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    // Initial check
    checkUser();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isAdmin = user?.email?.includes('admin') || 
                  user?.email === 'admin@helvetiforma.com' ||
                  user?.email === 'damien@helvetiforma.com';

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 lg:space-x-4">
        <div className="hidden sm:inline-block px-3 py-2 text-gray-400">
          Chargement...
        </div>
        <div className="px-3 py-2 text-gray-400 text-sm">
          Connexion requise
        </div>
      </div>
    );
  }

  if (user) {
    if (isAdmin) {
      // Admin user - show admin button, calendar, e-learning, cart, and logout
      return (
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Link
            href="/admin/dashboard"
            className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Admin</span>
          </Link>
          <Link
            href="/calendar"
            className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-sm"
          >
            Calendrier
          </Link>
          <Link
            href="/elearning"
            className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-sm"
          >
            E-learning
          </Link>
          <div className="relative">
            <CartIcon onClick={toggleCart} />
            <CartDropdown />
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          >
            Déconnexion
          </button>
        </div>
      );
    } else {
      // Regular user - show personal space, calendar, e-learning, cart, and logout
      return (
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Link
            href="/calendar"
            className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-sm"
          >
            Calendrier
          </Link>
          <Link
            href="/elearning"
            className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-sm"
          >
            E-learning
          </Link>
          <Link
            href="/personal-space"
            className="inline-block px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm"
          >
            Espace Personnel
          </Link>
          <div className="relative">
            <CartIcon onClick={toggleCart} />
            <CartDropdown />
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          >
            Déconnexion
          </button>
        </div>
      );
    }
  }

  // Not logged in - show login/register buttons and cart
  return (
    <div className="flex items-center space-x-2 lg:space-x-4">
      <div className="relative">
        <CartIcon onClick={toggleCart} />
        <CartDropdown />
      </div>
      <Link
        href="/login"
        className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-sm"
      >
        Connexion
      </Link>
    </div>
  );
} 