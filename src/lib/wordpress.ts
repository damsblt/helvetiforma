// WordPress and Tutor LMS API Configuration

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_APP_USER = process.env.WORDPRESS_APP_USER || 'gibivawa';

export const config = {
  wordpressUrl: WORDPRESS_URL,
  tutorApiUrl: TUTOR_API_URL,
  appUser: WORDPRESS_APP_USER,
  endpoints: {
    // WordPress Core API
    wp: {
      users: '/wp-json/wp/v2/users',
      posts: '/wp-json/wp/v2/posts',
      media: '/wp-json/wp/v2/media',
    },
    // Tutor LMS API (if available)
    tutor: {
      courses: '/wp-json/tutor/v1/courses',
      lessons: '/wp-json/tutor/v1/lessons',
      enrollments: '/wp-json/tutor/v1/enrollments',
      quizzes: '/wp-json/tutor/v1/quizzes',
      students: '/wp-json/tutor/v1/students',
      instructors: '/wp-json/tutor/v1/instructors',
      orders: '/wp-json/tutor/v1/orders',
    },
    // WordPress Custom Post Types for Tutor LMS
    wpTutor: {
      courses: '/wp-json/wp/v2/courses',
      lessons: '/wp-json/wp/v2/lessons',
      topics: '/wp-json/wp/v2/topics',
      quizzes: '/wp-json/wp/v2/tutor_quiz',
    },
    // Native WordPress Authentication (no plugins required)
    auth: {
      login: '/wp-login.php', // Native WordPress login
      validate: '/wp-json/wp/v2/users/me', // Validate current user
    },
    // Custom HelvetiForma endpoints
    helvetiforma: {
      register: '/wp-json/helvetiforma/v1/register',
    }
  }
};

// Helper function to get authentication headers (using native WordPress methods)
export function getAuthHeaders(credentials?: { username: string; password: string } | string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // If user credentials provided (for login)
  if (credentials && typeof credentials === 'object') {
    const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
    headers.Authorization = `Basic ${basicAuth}`;
  }
  // If session token/cookie provided (for authenticated requests)
  else if (credentials && typeof credentials === 'string') {
    // Check if it's a WordPress cookie format
    if (credentials.includes('wordpress_logged_in') || credentials.includes('wordpress_sec')) {
      headers.Cookie = credentials;
    }
    // Check if it's a base64 encoded session token (from our WordPress native login)
    else if (credentials.length > 20 && !credentials.includes(' ')) {
      try {
        const decoded = Buffer.from(credentials, 'base64').toString();
        const sessionData = JSON.parse(decoded);
        
        // If it's our session token format, use admin credentials for API calls
        if (sessionData.userId && sessionData.loginMethod === 'wordpress_native') {
          // Use admin app password for API calls on behalf of the logged-in user
          if (process.env.WORDPRESS_APP_PASSWORD) {
            const adminCredentials = Buffer.from(
              `${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`
            ).toString('base64');
            headers.Authorization = `Basic ${adminCredentials}`;
          }
        }
      } catch (e) {
        // If it's not JSON, treat as basic auth token
        headers.Authorization = `Basic ${credentials}`;
      }
    }
    // Otherwise treat as basic auth token
    else {
      headers.Authorization = `Basic ${credentials}`;
    }
  }
  // For admin operations, use Application Password
  else if (process.env.WORDPRESS_APP_PASSWORD) {
    const adminCredentials = Buffer.from(
      `${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`
    ).toString('base64');
    headers.Authorization = `Basic ${adminCredentials}`;
  }

  return headers;
}

// Helper to extract cookies from response
export function extractCookiesFromResponse(response: Response): string {
  const setCookieHeaders = response.headers.get('set-cookie');
  if (!setCookieHeaders) return '';
  
  // Extract WordPress authentication cookies
  const cookies = setCookieHeaders.split(',').map(cookie => cookie.trim());
  const authCookies = cookies.filter(cookie => 
    cookie.includes('wordpress_logged_in') || 
    cookie.includes('wordpress_sec') ||
    cookie.includes('wp-settings')
  );
  
  return authCookies.join('; ');
}

// Helper function to build full URL
export function buildUrl(endpoint: string, baseUrl: string = WORDPRESS_URL): string {
  return `${baseUrl}${endpoint}`;
}

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  throw new Error('Invalid response format: Expected JSON');
}
