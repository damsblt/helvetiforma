import Cookies from 'js-cookie';

export interface WordPressUser {
  id: number;
  email: string;
  name: string;
  token: string;
}

export async function loginWordPress(email: string, password: string): Promise<WordPressUser | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password })
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  const user = {
    id: data.user_id,
    email: data.user_email,
    name: data.user_display_name,
    token: data.token
  };
  
  // Stocker token dans cookie
  Cookies.set('wp_auth_token', data.token, { expires: 7 });
  
  return user;
}

export function getWordPressToken(): string | null {
  return Cookies.get('wp_auth_token') || null;
}

export function logoutWordPress() {
  Cookies.remove('wp_auth_token');
}
