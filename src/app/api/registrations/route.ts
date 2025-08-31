import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Enhanced storage detection with environment awareness
async function getStorage() {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';

    // Try to use Supabase first (production priority)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        // Test the connection
        const { data, error } = await supabase.from('registrations').select('count').limit(1);
        if (!error) {
          console.log('Using Supabase for registrations (production)');
          return { type: 'supabase' as const, client: supabase };
        }
      } catch (supabaseError) {
        console.log('Supabase connection test failed for registrations:', supabaseError);
      }
    }

    // Use local storage for development if explicitly requested
    if (isDevelopment && isLocalhost) {
      console.log('Using local storage for registrations (development)');
      return { type: 'local' as const, client: null };
    }

    // In production, if Supabase fails, we should fail gracefully
    if (!isDevelopment) {
      console.error('CRITICAL: Supabase connection failed in production');
      throw new Error('Database connection failed in production');
    }

  } catch (error) {
    console.error('Storage detection error:', error);
  }

  // Fallback to local storage only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Using local storage fallback (development only)');
    return { type: 'local' as const, client: null };
  }

  // In production, we must have Supabase
  throw new Error('Supabase connection required for production');
}

// Enhanced local storage with persistence across API calls
const localStorage = {
  registrations: [] as any[],

  // Add some sample registrations for development
  init() {
    if (this.registrations.length === 0) {
      const now = new Date();
      this.registrations = [
        {
          id: 1,
          session_id: 1,
          formation_id: 1,
          user_first_name: 'Marie',
          user_last_name: 'Dupont',
          user_email: 'marie.dupont@example.com',
          user_phone: '0123456789',
          status: 'pending',
          created_at: now.toISOString()
        }
      ];
      console.log('Initialized local storage with sample registration');
    }
  }
};

// Initialize local storage
localStorage.init();

// Save registration to storage
async function saveRegistration(registrationData: any) {
  const storage = await getStorage();
  
  if (storage.type === 'supabase') {
    const { data, error } = await storage.client
      .from('registrations')
      .insert([registrationData])
      .select();
    
    if (error) {
      console.error('Error saving registration to Supabase:', error);
      throw new Error('Failed to save registration');
    }
    
    console.log('Registration saved to Supabase:', data);
    return data[0];
  } else {
    // Local storage
    const newRegistration = {
      id: localStorage.registrations.length + 1,
      ...registrationData,
      created_at: new Date().toISOString()
    };
    
    localStorage.registrations.push(newRegistration);
    console.log('Registration saved to local storage:', newRegistration);
    return newRegistration;
  }
}

// Load registrations from storage
async function loadRegistrations() {
  const storage = await getStorage();
  
  if (storage.type === 'supabase') {
    const { data, error } = await storage.client
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading registrations from Supabase:', error);
      throw new Error('Failed to load registrations');
    }
    
    return data || [];
  } else {
    // Local storage
    return localStorage.registrations;
  }
}

// Update registration status
async function updateRegistrationStatus(id: number, status: string) {
  const storage = await getStorage();
  
  if (storage.type === 'supabase') {
    const { data, error } = await storage.client
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating registration status in Supabase:', error);
      throw new Error('Failed to update registration status');
    }
    
    return data[0];
  } else {
    // Local storage
    const registration = localStorage.registrations.find(r => r.id === id);
    if (registration) {
      registration.status = status;
      return registration;
    }
    throw new Error('Registration not found');
  }
}

// GET - Fetch all registrations
export async function GET() {
  try {
    const registrations = await loadRegistrations();
    return NextResponse.json({ data: registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// POST - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['session_id', 'formation_id', 'user_first_name', 'user_last_name', 'user_email', 'user_phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare registration data
    const registrationData = {
      session_id: body.session_id,
      formation_id: body.formation_id,
      user_first_name: body.user_first_name,
      user_last_name: body.user_last_name,
      user_email: body.user_email,
      user_phone: body.user_phone,
      status: 'pending'
    };

    // Save registration
    const savedRegistration = await saveRegistration(registrationData);

    // TODO: Send email notification to admin
    // This would integrate with your existing email system

    return NextResponse.json({ 
      data: savedRegistration,
      message: 'Registration submitted successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

// PATCH - Update registration status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      );
    }

    const updatedRegistration = await updateRegistrationStatus(id, status);

    return NextResponse.json({ 
      data: updatedRegistration,
      message: 'Registration status updated successfully' 
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
