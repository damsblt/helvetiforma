'use client';

import React from 'react';
import Link from 'next/link';

interface CalendarLinkProps {
  theme: 'Salaire' | 'Assurances sociales' | 'Impôt à la source';
  className?: string;
  variant?: 'button' | 'link' | 'icon';
  children?: React.ReactNode;
}

const CalendarLink: React.FC<CalendarLinkProps> = ({
  theme,
  className = '',
  variant = 'button',
  children,
}) => {
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'Salaire':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'Assurances sociales':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'Impôt à la source':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'Salaire':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'Assurances sociales':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'Impôt à la source':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'Salaire':
        return 'Voir le calendrier Salaires';
      case 'Assurances sociales':
        return 'Voir le calendrier Charges Sociales';
      case 'Impôt à la source':
        return 'Voir le calendrier Impôt à la Source';
      default:
        return 'Voir le calendrier';
    }
  };

  if (variant === 'icon') {
    return (
      <Link
        href={`/calendar?category=${encodeURIComponent(theme)}`}
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getThemeColor(theme)} transition-colors ${className}`}
        title={getThemeLabel(theme)}
      >
        {getThemeIcon(theme)}
      </Link>
    );
  }

  if (variant === 'link') {
    return (
      <Link
        href={`/calendar?category=${encodeURIComponent(theme)}`}
        className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors ${className}`}
      >
        {getThemeIcon(theme)}
        {children || getThemeLabel(theme)}
      </Link>
    );
  }

  // Default button variant
  return (
    <Link
      href={`/calendar?category=${encodeURIComponent(theme)}`}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${getThemeColor(theme)} ${className}`}
    >
      {getThemeIcon(theme)}
      {children || `Voir le calendrier ${theme}`}
    </Link>
  );
};

export default CalendarLink;
