'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Temporary bypass for testing - remove in production
    // Check if we're in development mode by looking at the hostname
    const isDevelopment = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isDevelopment) {
      // Skip authentication in development
      setIsLoading(false);
      setTimeout(() => setIsVisible(true), 100);
      return;
    }

    // Simple admin check using authService
    if (!authService.isAuthenticated()) {
      router.push('/login?redirect=/admin');
      return;
    }

    const user = authService.getUser();
    if (!user || !user.isAdmin) {
      router.push('/login?message=admin_required');
      return;
    }

    setIsLoading(false);
    // Trigger animation after a brief delay
    setTimeout(() => setIsVisible(true), 100);
  }, [router]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before redirecting
    setTimeout(() => {
      router.push('/');
    }, 200);
  };

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    // Don't prevent body scroll - let the admin panel handle its own scrolling
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // No need to reset body overflow since we're not setting it to hidden
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="text-center bg-white rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'administration...</p>
          <p className="text-sm text-gray-400 mt-2">Zone d'administration sécurisée</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 z-40 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Full Screen Modal */}
      <div className={`fixed inset-0 z-50 transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
          {/* Admin Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">HF</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">Administration HelvetiForma</h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/admin/dashboard"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    🏠 Dashboard
                  </Link>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Fermer l'administration"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Admin Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
} 