import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple Supabase client creation
function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}



// Save registration to Supabase
async function saveRegistration(registrationData: any) {
  try {
    const supabase = createSupabaseClient();
    console.log('Attempting to save to Supabase:', registrationData);
    
    const { data, error } = await supabase
      .from('registrations')
      .insert([registrationData])
      .select();
    
    if (error) {
      console.error('Error saving registration to Supabase:', error);
      throw new Error(`Failed to save registration: ${error.message}`);
    }
    
    console.log('Registration saved to Supabase:', data);
    return data[0];
  } catch (error) {
    console.error('Error in saveRegistration:', error);
    throw error;
  }
}

// Load registrations from Supabase
async function loadRegistrations() {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading registrations from Supabase:', error);
      throw new Error('Failed to load registrations');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in loadRegistrations:', error);
    throw error;
  }
}

// Update registration status
async function updateRegistrationStatus(id: number, status: string) {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating registration status in Supabase:', error);
      throw new Error('Failed to update registration status');
    }
    
    return data[0];
  } catch (error) {
    console.error('Error in updateRegistrationStatus:', error);
    throw error;
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
    console.log('POST request body:', body);
    
    // Validate required fields
    const requiredFields = ['session_id', 'formation_id', 'user_first_name', 'user_last_name', 'user_email', 'user_phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing field: ${field}`);
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

    console.log('Registration data prepared:', registrationData);

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
      { error: `Failed to create registration: ${error instanceof Error ? error.message : 'Unknown error'}` },
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
