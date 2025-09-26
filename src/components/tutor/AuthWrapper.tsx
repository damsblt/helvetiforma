'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import type { TutorUser } from '@/types/tutor';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'instructor' | 'student';
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ 
  children, 
  requireAuth = false, 
  requireRole,
  fallback 
}: AuthWrapperProps) {
  const [user, setUser] = useState<TutorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = authService.getUser();
      const isAuthenticated = authService.isAuthenticated();

      if (requireAuth && !isAuthenticated) {
        router.push('/tutor-login');
        return;
      }

      if (currentUser && isAuthenticated) {
        // Validate token
        const isValid = await authService.validateToken();
        if (!isValid) {
          authService.logout();
          if (requireAuth) {
            router.push('/tutor-login');
            return;
          }
        } else {
          setUser(currentUser);
        }
      }

      // Check role requirements
      if (requireRole && currentUser) {
        let roleCheck = false;
        switch (requireRole) {
          case 'admin':
            roleCheck = currentUser.isAdmin;
            break;
          case 'instructor':
            roleCheck = currentUser.isInstructor || currentUser.isAdmin;
            break;
          case 'student':
            roleCheck = currentUser.isStudent || currentUser.isInstructor || currentUser.isAdmin;
            break;
        }

        if (!roleCheck) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
      }

      setHasAccess(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, requireRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <button
            onClick={() => router.push('/tutor-login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (requireRole && !hasAccess) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
