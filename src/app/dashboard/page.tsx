'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getUser();
    
    if (!user) {
      // No user logged in, redirect to login
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (user.isAdmin) {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/student');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
