// Using custom WordPress endpoints for authentication with user capabilities
// This ensures proper admin detection and secure authentication
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
  identifier: string; // Can be either email or username
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

  // Login using custom WordPress authentication endpoint
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Use custom WordPress authentication endpoint with secret key
      // This endpoint returns user capabilities for proper admin detection
      const response = await fetch(`${this.baseUrl}/wp-json/wcra/v1/helvetiforma/v1/auth/login/?secret_key=oV9gdjpkmCMV2NK0pd81SawWriGEtV0K`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.identifier, // email or username
          password: credentials.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Debug logging to see what we're getting from custom endpoint
        console.log('Custom endpoint response:', data);
        
        // Handle the custom response from your WordPress endpoint
        if (data.success && data.user) {
          const user: User = {
            id: data.user.id || 0,
            email: data.user.email || credentials.identifier,
            firstName: data.user.first_name || data.user.firstName || '',
            lastName: data.user.last_name || data.user.lastName || '',
            isAdmin: data.user.isAdmin || data.user.capabilities?.administrator || false,
            roles: data.user.roles || Object.keys(data.user.capabilities || {})
          };

          console.log('Final user object from custom endpoint:', user);
          
          // Use the token from your custom endpoint or create one
          const token = data.token || btoa(JSON.stringify({ id: user.id, email: user.email }));
          
          this.setAuth(token, user);
          
          return {
            success: true,
            user: user,
            token: token
          };
        } else {
          return {
            success: false,
            message: data.message || 'Identifiant ou mot de passe incorrect',
          };
        }
      } else {
        return {
          success: false,
          message: 'Identifiant ou mot de passe incorrect',
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

  // Register using custom WordPress registration endpoint
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Use custom WordPress registration endpoint with secret key
      const response = await fetch(`${this.baseUrl}/wp-json/wcra/v1/helvetiforma/v1/auth/register/?secret_key=oV9gdjpkmCMV2NK0pd81SawWriGEtV0K`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          return {
            success: true,
            message: data.message || 'Compte créé avec succès',
          };
        } else {
          return {
            success: false,
            message: data.message || 'Erreur lors de la création du compte',
          };
        }
      } else {
        return {
          success: false,
          message: 'Erreur lors de la création du compte',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
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
