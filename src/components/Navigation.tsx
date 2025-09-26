'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { cartService } from '@/services/cartService';
import type { TutorUser } from '@/types/tutor';

export default function Navigation() {
  const [user, setUser] = useState<TutorUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);

    // Initial cart count
    setCartCount(cartService.getItemCount());

    // Listen for auth changes
    const checkAuth = () => {
      const updatedUser = authService.getUser();
      setUser(updatedUser);
    };

    // Listen for cart updates
    const unsubscribeCart = cartService.onCartUpdate((cart) => {
      setCartCount(cart.items.length);
    });

    // Simple polling for auth state changes
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      clearInterval(interval);
      unsubscribeCart();
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/';
  };

  const isActivePage = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/concept', label: 'Concept' },
    { href: '/formations', label: 'Formations' },
    { href: '/docs', label: 'Documentation' },
    { href: '/contact', label: 'Contact' },
  ];

  const authLinks = user ? [
    { href: '/tableau-de-bord', label: 'Tableau de bord' },
    ...(user.isInstructor || user.isAdmin ? [
      { href: '/admin', label: 'Administration' }
    ] : []),
  ] : [
    { href: '/tutor-login', label: 'Connexion' },
    { href: '/inscription-des-apprenants', label: 'Inscription' },
    // Hidden: { href: '/inscription-des-formateurs-et-formatrices', label: 'Inscription Formateur' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">HelvetiForma</span>
            </Link>
          </div>

          {/* Center: Main Navigation Menu */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActivePage(link.href)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: E-commerce buttons (Cart, Auth) */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {/* Enhanced Cart Button */}
            <Link
              href="/panier"
              className="flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-blue-600 relative"
              title="Panier"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z" />
              </svg>
              <span className="text-sm font-medium">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/tableau-de-bord"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActivePage('/tableau-de-bord')
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  Tableau de bord
                </Link>
                {(user.isInstructor || user.isAdmin) && (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActivePage('/admin')
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    Administration
                  </Link>
                )}
                <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    Bonjour, {user.firstName || user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/tutor-login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 hover:text-blue-600"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription-des-apprenants"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {/* Main Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePage(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* E-commerce Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {/* Cart Link */}
                <Link
                  href="/panier"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z" />
                  </svg>
                  Panier
                </Link>

                {/* Auth Links */}
                {user ? (
                  <div className="space-y-2 pt-2">
                    <Link
                      href="/tableau-de-bord"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium transition-colors ${
                        isActivePage('/tableau-de-bord')
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      Tableau de bord
                    </Link>
                    {(user.isInstructor || user.isAdmin) && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePage('/admin')
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        Administration
                      </Link>
                    )}
                    <div className="px-3 py-2 border-t border-gray-200 mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Bonjour, {user.firstName || user.username}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link
                      href="/tutor-login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/inscription-des-apprenants"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mx-3"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
