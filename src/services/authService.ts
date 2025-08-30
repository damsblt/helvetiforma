export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
}

export interface SetupPasswordData {
  token: string;
  password: string;
}

class AuthService {
  private baseUrl: string;
  private tokenKey = 'helvetiforma_token';
  private userKey = 'helvetiforma_user';

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
  }

  // Get stored token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // Get stored user
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Store token and user
  setAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  // Clear auth data
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin || false;
  }

  // Login using WordPress built-in authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Use WordPress standard authentication with Basic Auth
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.email}:${credentials.password}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Check if user has admin capabilities
        const isAdmin = userData.capabilities?.administrator || false;
        
        const user: User = {
          id: userData.id,
          email: userData.email || credentials.email,
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          isAdmin: isAdmin,
          roles: Object.keys(userData.capabilities || {})
        };

        // Create a simple token (or use WordPress nonce)
        const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
        
        this.setAuth(token, user);
        
        return {
          success: true,
          user: user,
          token: token
        };
      } else {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Register using WordPress built-in user creation
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Note: WordPress requires admin privileges to create users via REST API
      // For now, we'll return an error suggesting to contact admin
      return {
        success: false,
        message: 'Pour créer un compte, veuillez contacter l\'administrateur. L\'inscription automatique n\'est pas activée.',
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription',
      };
    }
  }

  // Logout (just clear local storage)
  async logout(): Promise<AuthResponse> {
    try {
      this.clearAuth();
      
      return {
        success: true,
        message: 'Déconnexion réussie',
      };
    } catch (error) {
      console.error('Logout error:', error);
      this.clearAuth();
      return {
        success: true,
        message: 'Déconnexion réussie',
      };
    }
  }

  // Verify token
  async verifyToken(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'Aucun token trouvé',
        };
      }

      const response = await fetch(`${this.baseUrl}/wp-json/helvetiforma/v1/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Update stored user data
        this.setAuth(token, data.user);
        return data;
      } else {
        this.clearAuth();
        return {
          success: false,
          message: 'Token invalide',
        };
      }
    } catch (error) {
      console.error('Verify token error:', error);
      this.clearAuth();
      return {
        success: false,
        message: 'Erreur de vérification du token',
      };
    }
  }

  // Setup password
  async setupPassword(setupData: SetupPasswordData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/helvetiforma/v1/auth/setup-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        this.setAuth(data.token, data.user);
        return data;
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la configuration du mot de passe',
        };
      }
    } catch (error) {
      console.error('Setup password error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
