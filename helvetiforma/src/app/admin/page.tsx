'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Small delay to show the loading message
    const timer = setTimeout(() => {
      router.push('/admin/dashboard');
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers le tableau de bord...</p>
        <p className="text-sm text-gray-400 mt-2">Zone d'administration</p>
      </div>
    </div>
  );
} 