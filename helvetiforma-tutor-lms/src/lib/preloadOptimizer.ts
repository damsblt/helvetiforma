/**
 * Preload Optimizer - Handles resource preload warnings and optimization
 */

export function initPreloadOptimizer() {
  if (typeof window === 'undefined') return;

  // Track preloaded resources
  const preloadedResources = new Set<string>();
  
  // Monitor resource usage
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name && preloadedResources.has(entry.name)) {
        // Resource was used - remove from tracking
        preloadedResources.delete(entry.name);
      }
    }
  });

  // Observe resource timing
  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {
    // Silently fail if PerformanceObserver is not supported
  }

  // Track link preload elements
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  preloadLinks.forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    if (href) {
      preloadedResources.add(href);
    }
  });

  // Clean up unused preloads after a delay
  setTimeout(() => {
    preloadedResources.forEach((resource) => {
      console.warn(`Unused preloaded resource detected: ${resource}`);
      // Could remove the link element here if needed
    });
  }, 10000); // 10 seconds after page load

  // Cleanup observer on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
}

/**
 * Suppress specific console warnings related to preloading
 */
export function suppressPreloadWarnings() {
  if (typeof window === 'undefined') return;

  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress preload warnings
    if (message.includes('preloaded using link preload but not used')) {
      return;
    }
    
    // Suppress WordPress stats warnings
    if (message.includes('stats.wp.com') || message.includes('wordpress.com')) {
      return;
    }
    
    // Call original warn for other messages
    originalWarn.apply(console, args);
  };
}

/**
 * Initialize all optimizations
 */
export function initializeOptimizations() {
  initPreloadOptimizer();
  suppressPreloadWarnings();
}
