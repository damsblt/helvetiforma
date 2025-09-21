# Blog Preloading System

## Overview

This system eliminates loading delays when visitors navigate to the `/docs` page by preloading all WordPress blog posts and categories when they first arrive on the web app.

## How It Works

### 1. BlogContext (`src/contexts/BlogContext.tsx`)
- Global state management for all WordPress blog data
- Automatic caching with 10-minute expiration (longer than products since blog content changes less frequently)
- Preloads blog data on app initialization
- Provides hooks for components to access cached blog data

### 2. Root Layout Integration (`src/app/layout.tsx`)
- `BlogProvider` wraps the entire app (alongside ProductsProvider)
- Blog data is automatically loaded when the app starts
- Available to all components throughout the app

### 3. Updated Docs Page
- `src/app/docs/page.tsx` - Uses preloaded blog data
- `src/app/docs/DocsList.tsx` - Uses preloaded blog data for filtering
- No more individual API calls on page load

### 4. Unified Cache Management
- Extended `src/utils/productCache.ts` to handle both products and blog data
- Single cache invalidation endpoint for all data types
- Centralized cache management system

## Performance Benefits

- **Before**: Loading delay on each docs page visit
- **After**: Instant loading using cached blog data
- **Cache Duration**: 10 minutes (configurable)
- **Memory Efficient**: Blog data cached in React context

## Usage

### Accessing Blog Data in Components

```tsx
import { useBlog } from '@/contexts/BlogContext';

function MyComponent() {
  const { 
    articles, 
    categories,
    categoryNames,
    loading, 
    isInitialized,
    getArticleById,
    getArticlesByCategory 
  } = useBlog();

  if (!isInitialized || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {articles.map(article => (
        <div key={article.id}>{article.title.rendered}</div>
      ))}
    </div>
  );
}
```

### Filtering Articles by Category

```tsx
const { getArticlesByCategory } = useBlog();

// Get all articles
const allArticles = getArticlesByCategory('Toutes');

// Get articles from specific category
const techArticles = getArticlesByCategory('Technology');
```

### Invalidating Cache

```tsx
import { invalidateCache } from '@/utils/productCache';

// Force refresh all caches (products and blog)
invalidateCache();
```

### API Endpoint for Cache Invalidation

```bash
POST /api/products/invalidate-cache
```

## Configuration

### Cache Duration
Edit `CACHE_DURATION` in `src/contexts/BlogContext.tsx`:

```tsx
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### WordPress API Endpoints
The system uses these WordPress REST API endpoints:
- `/wp-json/wp/v2/posts?per_page=100` - Fetch blog posts
- `/wp-json/wp/v2/categories` - Fetch categories

## Data Structure

### BlogArticle Interface
```tsx
interface BlogArticle {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  categories: number[];
  // ... other WordPress fields
}
```

### BlogCategory Interface
```tsx
interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}
```

## Features

- **Smart Filtering**: Filter articles by category using `getArticlesByCategory()`
- **Category Management**: Automatic category name extraction and filtering
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Proper loading states during data fetching
- **Cache Validation**: Intelligent cache validation and refresh

## Monitoring

The system includes console logging for:
- Blog data loading events
- Cache hits/misses
- Performance metrics
- Error handling

## Future Enhancements

1. **Background Refresh**: Automatically refresh cache before expiration
2. **Selective Loading**: Load only essential blog data initially
3. **Service Worker**: Cache blog data in browser storage
4. **Analytics**: Track cache performance and hit rates
5. **Search**: Add full-text search capabilities
6. **Pagination**: Handle large numbers of blog posts efficiently
