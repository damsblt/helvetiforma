'use client';

import React from 'react';
import SubscriptionEnrollment from '@/components/SubscriptionEnrollment';

export default function SubscribePage() {
  // For now, we'll use student ID 1 (gibivawa) as an example
  // In a real app, this would come from authentication context
  const studentId = 1;

  const handleEnrollmentComplete = (subscription: any) => {
    alert(`Félicitations ! Vous êtes maintenant abonné à ${subscription.name}`);
    // Redirect to dashboard or show success message
  };

  return (
    <SubscriptionEnrollment 
      studentId={studentId} 
      onEnrollmentComplete={handleEnrollmentComplete}
    />
  );
}
