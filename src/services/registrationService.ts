// Service for handling Tutor LMS registration
export interface RegistrationFormData {
  form_html: string;
  page_title: string;
  page_url: string;
  page_id: number;
}

export interface RegistrationUrlData {
  url: string;
  title: string;
  page_id: number;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  user_id?: number;
  username?: string;
}

class RegistrationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
  }

  /**
   * Get the registration form HTML from Tutor LMS
   */
  async getRegistrationForm(): Promise<RegistrationFormData> {
    const response = await fetch(`${this.baseUrl}/wp-json/helvetiforma/v1/registration-form`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch registration form');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load registration form');
    }
    
    return data;
  }

  /**
   * Get the registration page URL
   */
  async getRegistrationUrl(): Promise<RegistrationUrlData> {
    const response = await fetch(`${this.baseUrl}/wp-json/helvetiforma/v1/registration-url`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch registration URL');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load registration URL');
    }
    
    return data;
  }

  /**
   * Register a new user via API
   */
  async registerUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
  }): Promise<RegistrationResponse> {
    const response = await fetch(`${this.baseUrl}/wp-json/helvetiforma/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  }

  /**
   * Check if registration form is available
   */
  async isRegistrationAvailable(): Promise<boolean> {
    try {
      await this.getRegistrationForm();
      return true;
    } catch (error) {
      console.error('Registration not available:', error);
      return false;
    }
  }
}

export const registrationService = new RegistrationService();

