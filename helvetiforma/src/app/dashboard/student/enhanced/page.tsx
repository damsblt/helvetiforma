'use client';

import React from 'react';
import StudentDashboard from '@/components/StudentDashboard';

export default function EnhancedStudentDashboardPage() {
  // For now, we'll use student ID 1 (gibivawa) as an example
  // In a real app, this would come from authentication context
  const studentId = 1;

  return <StudentDashboard studentId={studentId} />;
}
