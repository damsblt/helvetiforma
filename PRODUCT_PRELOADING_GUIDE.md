# Product Preloading System

## Overview

This system eliminates the 3-second delay when visitors navigate to formation pages by preloading all WooCommerce products when they first arrive on the web app.

## How It Works

### 1. ProductsContext (`src/contexts/ProductsContext.tsx`)
- Global state management for all WooCommerce products
- Automatic caching with 5-minute expiration
- Preloads products on app initialization
- Provides hooks for components to access cached products

### 2. Root Layout Integration (`src/app/layout.tsx`)
- `ProductsProvider` wraps the entire app
- Products are automatically loaded when the app starts
- Available to all components throughout the app

### 3. Updated Formation Pages
- `src/app/formation/[slug]/page.tsx` - Uses preloaded products
- `src/components/FormationDetails.tsx` - Uses preloaded products
- No more individual API calls on each page load

### 4. Cache Management (`src/utils/productCache.ts`)
- Centralized cache invalidation system
- Can be triggered from anywhere in the app
- Useful for webhooks or admin actions

## Performance Benefits

- **Before**: 3+ second delay on each formation page
- **After**: Instant loading using cached products
- **Cache Duration**: 5 minutes (configurable)
- **Memory Efficient**: Products cached in React context

## Usage

### Accessing Products in Components

```tsx
import { useProducts } from '@/contexts/ProductsContext';

function MyComponent() {
  const { 
    courseProducts, 
    loading, 
    isInitialized,
    getProductById 
  } = useProducts();

  if (!isInitialized || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {courseProducts.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Invalidating Cache

```tsx
import { invalidateProductCache } from '@/utils/productCache';

// Force refresh products
invalidateProductCache();
```

### API Endpoint for Cache Invalidation

```bash
POST /api/products/invalidate-cache
```

## Configuration

### Cache Duration
Edit `CACHE_DURATION` in `src/contexts/ProductsContext.tsx`:

```tsx
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### API Endpoint
The system uses `/api/woocommerce/course-products` to fetch products. This endpoint:
- Fetches all published products
- Filters for course products (with tutor course ID)
- Returns transformed product data

## Testing

Run the performance test:

```bash
node test-product-preloading.js
```

This will test:
1. Initial page load (triggers preloading)
2. Formation page load (uses cached products)
3. Direct API call performance

## Monitoring

The system includes console logging for:
- Product loading events
- Cache hits/misses
- Performance metrics
- Error handling

## Future Enhancements

1. **Background Refresh**: Automatically refresh cache before expiration
2. **Selective Loading**: Load only essential product data initially
3. **Service Worker**: Cache products in browser storage
4. **Analytics**: Track cache performance and hit rates
