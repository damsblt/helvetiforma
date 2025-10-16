'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SimpleTestPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    console.log('🔄 Simple test page useEffect running for slug:', slug);
    
    const timer = setTimeout(() => {
      setLoading(false);
      setMessage(`Test page for course: ${slug}. If you see this, client-side rendering is working.`);
      console.log('✅ Simple test page loaded successfully');
    }, 2000);

    return () => clearTimeout(timer);
  }, [slug]);

  console.log('🔄 Simple test page rendered, loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading simple test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{message}</h1>
        <p className="text-gray-600">This is a simple test page to verify client-side rendering works.</p>
      </div>
    </div>
  );
}

