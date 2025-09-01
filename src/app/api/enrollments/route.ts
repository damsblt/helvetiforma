import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Enhanced storage detection with environment awareness
async function getStorage() {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('enrollments').select('count').limit(1);
        if (!error) {
          console.log('Using Supabase for enrollments (production)');
          return { type: 'supabase' as const, client: supabase };
        }
      } catch (supabaseError) {
        console.log('Supabase connection test failed for enrollments:', supabaseError);
      }
    }
    
    if (isDevelopment && isLocalhost) {
      console.log('Using local storage for enrollments (development)');
      return { type: 'local' as const, client: null };
    }
    
    if (!isDevelopment) {
      console.error('CRITICAL: Supabase connection failed in production');
      throw new Error('Database connection failed in production');
    }
    
  } catch (error) {
    console.error('Enrollments storage detection error:', error);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Using local enrollments data (development only)');
    return { type: 'local' as const, client: null };
  }
  
  throw new Error('Supabase connection required for production');
}

// Mock enrollments data for development
const mockEnrollments = [
  {
    id: 1,
    user_id: 1,
    training_session_id: 1,
    status: "enrolled",
    enrollment_date: "2024-12-01T10:00:00Z",
    completion_date: null,
    progress: 0,
    certificate_issued: false,
    payment_status: "paid",
    payment_amount: 1200,
    payment_currency: "CHF",
    notes: "Intéressé par les aspects pratiques",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: 2,
    user_id: 2,
    training_session_id: 1,
    status: "enrolled",
    enrollment_date: "2024-12-02T14:30:00Z",
    completion_date: null,
    progress: 0,
    certificate_issued: false,
    payment_status: "pending",
    payment_amount: 1200,
    payment_currency: "CHF",
    notes: "Demande de facture entreprise",
    created_at: "2024-12-02T14:30:00Z",
    updated_at: "2024-12-02T14:30:00Z"
  },
  {
    id: 3,
    user_id: 3,
    training_session_id: 2,
    status: "enrolled",
    enrollment_date: "2024-12-03T09:15:00Z",
    completion_date: null,
    progress: 0,
    certificate_issued: false,
    payment_status: "paid",
    payment_amount: 980,
    payment_currency: "CHF",
    notes: "Formation recommandée par un collègue",
    created_at: "2024-12-03T09:15:00Z",
    updated_at: "2024-12-03T09:15:00Z"
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const sessionId = searchParams.get('training_session_id');
    const status = searchParams.get('status');
    
    const storage = await getStorage();
    
    if (storage.type === 'supabase' && storage.client) {
      let query = storage.client.from('enrollments').select('*');
      
      if (userId) query = query.eq('user_id', userId);
      if (sessionId) query = query.eq('training_session_id', sessionId);
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.order('enrollment_date', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        data: data || [],
        meta: {
          total: data?.length || 0
        }
      });
    } else {
      // Filter mock data for development
      let filteredData = mockEnrollments;
      
      if (userId) {
        filteredData = filteredData.filter(e => e.user_id === parseInt(userId));
      }
      if (sessionId) {
        filteredData = filteredData.filter(e => e.training_session_id === parseInt(sessionId));
      }
      if (status) {
        filteredData = filteredData.filter(e => e.status === status);
      }
      
      return NextResponse.json({
        data: filteredData,
        meta: {
          total: filteredData.length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const storage = await getStorage();
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.training_session_id) {
      return NextResponse.json(
        { error: 'user_id and training_session_id are required' },
        { status: 400 }
      );
    }
    
    if (storage.type === 'supabase' && storage.client) {
      // Check if user is already enrolled
      const { data: existingEnrollment } = await storage.client
        .from('enrollments')
        .select('id')
        .eq('user_id', body.user_id)
        .eq('training_session_id', body.training_session_id)
        .single();
      
      if (existingEnrollment) {
        return NextResponse.json(
          { error: 'User is already enrolled in this training session' },
          { status: 409 }
        );
      }
      
      const { data, error } = await storage.client
        .from('enrollments')
        .insert([{
          ...body,
          status: body.status || 'enrolled',
          enrollment_date: new Date().toISOString(),
          progress: 0,
          certificate_issued: false
        }])
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { error: 'Failed to create enrollment' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        data: data?.[0],
        message: 'Enrollment created successfully'
      });
    } else {
      // Mock creation for development
      const newEnrollment = {
        ...body,
        id: Date.now(),
        status: body.status || 'enrolled',
        enrollment_date: new Date().toISOString(),
        progress: 0,
        certificate_issued: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json({
        data: newEnrollment,
        message: 'Enrollment created successfully (mock)'
      });
    }
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
