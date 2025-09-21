// Product and Blog cache utilities for managing cache invalidation

export class CacheManager {
  private static instance: CacheManager;
  private refreshCallbacks: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Register a callback to be called when cache needs to be refreshed
  registerRefreshCallback(callback: () => void): () => void {
    this.refreshCallbacks.add(callback);
    
    // Return unregister function
    return () => {
      this.refreshCallbacks.delete(callback);
    };
  }

  // Trigger cache refresh for all registered callbacks
  invalidateCache(): void {
    console.log('CacheManager: Invalidating cache');
    this.refreshCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('CacheManager: Error in refresh callback:', error);
      }
    });
  }

  // Clear all callbacks (useful for cleanup)
  clearCallbacks(): void {
    this.refreshCallbacks.clear();
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Utility function to invalidate cache from anywhere in the app
export const invalidateCache = (): void => {
  cacheManager.invalidateCache();
};

// Legacy exports for backward compatibility
export const productCacheManager = cacheManager;
export const invalidateProductCache = invalidateCache;
