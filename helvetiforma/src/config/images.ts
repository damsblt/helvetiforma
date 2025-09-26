// Image Configuration for Helvetiforma
// This file contains all image paths and optimization settings

export const images = {
  // Hero Images
  hero: {
    background: '/images/hero-bg.jpg',
    alt: 'Formation professionnelle en Suisse'
  },
  
  // Concept Page Images
  concept: {
    hero: '/images/concept-hero.jpg',
    learningApproach: '/images/learning-approach.jpg',
    philosophy: '/images/philosophy-image.jpg',
    ctaBackground: '/images/concept-cta-bg.jpg'
  },
  
  // Contact Page Images
  contact: {
    hero: '/images/contact-hero.jpg'
  },
  
  // Icon Images
  icons: {
    certification: '/images/certification-icon.png',
    flexibility: '/images/flexibility-icon.png',
    support: '/images/support-icon.png',
    onlineLearning: '/images/online-learning-icon.png',
    onsiteLearning: '/images/onsite-learning-icon.png',
    blendedLearning: '/images/blended-learning-icon.png',
    quality: '/images/quality-icon.png',
    location: '/images/location-icon.png',
    phone: '/images/phone-icon.png',
    email: '/images/email-icon.png',
    clock: '/images/clock-icon.png'
  },
  
  // Stats Section
  stats: {
    background: '/images/stats-bg.jpg'
  }
};

// Image Optimization Settings
export const imageSettings = {
  // Hero images - high priority, full quality
  hero: {
    priority: true,
    quality: 90,
    sizes: '100vw'
  },
  
  // Content images - medium priority
  content: {
    priority: false,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  },
  
  // Icons - low priority, optimized
  icons: {
    priority: false,
    quality: 80,
    sizes: 'auto'
  }
};

// Default image dimensions for common use cases
export const imageDimensions = {
  hero: { width: 1920, height: 1080 },
  content: { width: 800, height: 600 },
  icon: { width: 64, height: 64 },
  smallIcon: { width: 24, height: 24 }
};
