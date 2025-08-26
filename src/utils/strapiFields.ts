// Utility functions to fetch Strapi field configurations

export interface StrapiFieldConfig {
  Type: {
    type: 'enumeration';
    enum: string[];
  };
  Theme: {
    type: 'enumeration';
    enum: string[];
  };
}

// Default values based on the schema
export const DEFAULT_FIELD_CONFIG: StrapiFieldConfig = {
  Type: {
    type: 'enumeration',
    enum: ['Présentiel', 'En ligne']
  },
  Theme: {
    type: 'enumeration',
    enum: ['Salaire', 'Assurances sociales', 'Impôt à la source']
  }
};

// Function to fetch field configurations from Strapi
export async function fetchStrapiFieldConfig(): Promise<StrapiFieldConfig> {
  try {
    // Note: Strapi doesn't expose schema via API by default
    // For now, we'll use the default values from the schema
    // In a production environment, you might want to create a custom endpoint
    return DEFAULT_FIELD_CONFIG;
  } catch (error) {
    console.error('Error fetching Strapi field config:', error);
    return DEFAULT_FIELD_CONFIG;
  }
}

// Function to get Type options
export function getTypeOptions(): string[] {
  return DEFAULT_FIELD_CONFIG.Type.enum;
}

// Function to get Theme options
export function getThemeOptions(): string[] {
  return DEFAULT_FIELD_CONFIG.Theme.enum;
}

// Function to validate if a value is valid for a field
export function isValidTypeValue(value: string): boolean {
  return getTypeOptions().includes(value);
}

export function isValidThemeValue(value: string): boolean {
  return getThemeOptions().includes(value);
} 