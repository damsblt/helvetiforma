'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeaderButtons() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          Calendrier
        </div>
        <div className="px-3 py-2 text-gray-400 text-sm">
          Coin des Docs
        </div>
      </div>
    );
  }

  if (user) {
    if (isAdmin) {
      // Admin user - show dashboard link, calendar, docs, and logout
      return (
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Link
            href="/calendar"
            className="px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm font-medium"
          >
            Calendrier
          </Link>
          <Link
            href="/docs"
            className="px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm font-medium"
          >
            Coin des Docs
          </Link>
          <Link
            href="/admin"
            className="hidden sm:inline-block px-3 py-2 text-blue-700 hover:text-blue-800 transition text-sm font-medium"
          >
            Dashboard
          </Link>
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
      // Regular user - show personal space, calendar, docs, and logout
      return (
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Link
            href="/calendar"
            className="px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm font-medium"
          >
            Calendrier
          </Link>
          <Link
            href="/docs"
            className="px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm font-medium"
          >
            Coin des Docs
          </Link>
          <Link
            href="/personal-space"
            className="inline-block px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm"
          >
            Espace Personnel
          </Link>
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

  // Not logged in - show calendar and docs buttons
  return (
    <div className="flex items-center space-x-2 lg:space-x-4">
      <Link
        href="/calendar"
        className="px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm font-medium"
      >
        Calendrier
      </Link>
      <Link
        href="/docs"
        className="px-3 py-2 text-gray-700 hover:text-blue-700 transition text-sm font-medium"
      >
        Coin des Docs
      </Link>
    </div>
  );
} 