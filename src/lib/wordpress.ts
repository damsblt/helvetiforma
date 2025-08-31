// WordPress API utility functions
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://www.helvetiforma.ch/wp-json';

export interface WordPressPage {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  date: string;
  modified: string;
  status: string;
}

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  date: string;
  modified: string;
  status: string;
  categories: number[];
}

// Fetch WordPress page by slug
export async function getWordPressPageBySlug(slug: string): Promise<WordPressPage | null> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/pages?slug=${slug}&_embed`);
    if (!res.ok) {
      throw new Error(`Failed to fetch page with slug: ${slug}`);
    }
    const pages = await res.json();
    return pages[0] || null;
  } catch (error) {
    console.error(`Error fetching WordPress page ${slug}:`, error);
    return null;
  }
}

// Fetch WordPress page by ID
export async function getWordPressPageById(id: number): Promise<WordPressPage | null> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/pages/${id}?_embed`);
    if (!res.ok) {
      throw new Error(`Failed to fetch page with ID: ${id}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching WordPress page ${id}:`, error);
    return null;
  }
}

// Fetch all WordPress pages
export async function getAllWordPressPages(): Promise<WordPressPage[]> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/pages?per_page=100&_embed`);
    if (!res.ok) {
      throw new Error('Failed to fetch WordPress pages');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching WordPress pages:', error);
    return [];
  }
}

// Fetch WordPress posts
export async function getWordPressPosts(perPage: number = 10): Promise<WordPressPost[]> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/posts?per_page=${perPage}&_embed`);
    if (!res.ok) {
      throw new Error('Failed to fetch WordPress posts');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}

// Fetch WordPress post by slug
export async function getWordPressPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/posts?slug=${slug}&_embed`);
    if (!res.ok) {
      throw new Error(`Failed to fetch post with slug: ${slug}`);
    }
    const posts = await res.json();
    return posts[0] || null;
  } catch (error) {
    console.error(`Error fetching WordPress post ${slug}:`, error);
    return null;
  }
}
