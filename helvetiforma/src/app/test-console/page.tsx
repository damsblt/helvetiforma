'use client';

import { useEffect } from 'react';

export default function TestConsolePage() {
  useEffect(() => {
    // Test console suppression
    setTimeout(() => {
      console.error('Test error: stats.wp.com should be suppressed');
      console.error('Test error: ERR_BLOCKED_BY_CLIENT should be suppressed');
      console.warn('Test warning: Potential permissions policy violation: payment is not allowed should be suppressed');
      console.error('Test error: Refused to display should be suppressed');
      console.error('Test error: This should NOT be suppressed');
      console.log('Console suppression test completed');
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Console Error Suppression Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p className="mb-2">This page tests console error suppression.</p>
        <p className="mb-2">Check the browser console - you should see:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ "Console suppression test completed"</li>
          <li>✅ "Test error: This should NOT be suppressed"</li>
          <li>❌ No WordPress stats errors</li>
          <li>❌ No blocked client errors</li>
          <li>❌ No payment policy warnings</li>
          <li>❌ No frame display errors</li>
        </ul>
      </div>
    </div>
  );
}

