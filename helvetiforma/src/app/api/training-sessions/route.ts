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
        const { data, error } = await supabase.from('training_sessions').select('count').limit(1);
        if (!error) {
          console.log('Using Supabase for training sessions (production)');
          return { type: 'supabase' as const, client: supabase };
        }
      } catch (supabaseError) {
        console.log('Supabase connection test failed for training sessions:', supabaseError);
      }
    }
    
    if (isDevelopment && isLocalhost) {
      console.log('Using local storage for training sessions (development)');
      return { type: 'local' as const, client: null };
    }
    
    if (!isDevelopment) {
      console.error('CRITICAL: Supabase connection failed in production');
      throw new Error('Database connection failed in production');
    }
    
  } catch (error) {
    console.error('Training sessions storage detection error:', error);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Using local training sessions data (development only)');
    return { type: 'local' as const, client: null };
  }
  
  throw new Error('Supabase connection required for production');
}

// Mock training sessions data for development
const mockTrainingSessions = [
  {
    id: 1,
    formation_id: 1,
    title: "Formation Salaires - Session Janvier 2025",
    description: "Formation complète sur la gestion des salaires en Suisse",
    start_date: "2025-01-15",
    end_date: "2025-01-17",
    start_time: "09:00",
    end_time: "17:00",
    location: "Genève, Centre de Formation",
    max_participants: 12,
    current_participants: 8,
    price: 1200,
    currency: "CHF",
    status: "active",
    instructor: "Marie Dubois",
    type: "présentiel",
    difficulty: "intermédiaire",
    materials: [
      "Manuel de formation",
      "Exercices pratiques",
      "Support PowerPoint",
      "Certificat de participation"
    ],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: 2,
    formation_id: 2,
    title: "Charges Sociales - Session Février 2025",
    description: "Formation approfondie sur les charges sociales et assurances",
    start_date: "2025-02-10",
    end_date: "2025-02-12",
    start_time: "09:00",
    end_time: "17:00",
    location: "Lausanne, Institut de Formation",
    max_participants: 15,
    current_participants: 12,
    price: 980,
    currency: "CHF",
    status: "active",
    instructor: "Pierre Martin",
    type: "présentiel",
    difficulty: "avancé",
    materials: [
      "Guide des charges sociales",
      "Cas pratiques",
      "Calculs et exemples",
      "Certificat de formation"
    ],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: 3,
    formation_id: 3,
    title: "Impôt à la Source - Session Mars 2025",
    description: "Formation spécialisée sur l'impôt à la source",
    start_date: "2025-03-05",
    end_date: "2025-03-06",
    start_time: "09:00",
    end_time: "17:00",
    location: "Zurich, Centre de Formation",
    max_participants: 20,
    current_participants: 15,
    price: 750,
    currency: "CHF",
    status: "active",
    instructor: "Sophie Weber",
    type: "hybride",
    difficulty: "spécialisé",
    materials: [
      "Guide fiscal",
      "Formulaires officiels",
      "Exemples de calculs",
      "Certificat de formation"
    ],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  }
];

export async function GET() {
  try {
    const storage = await getStorage();
    
    if (storage.type === 'supabase' && storage.client) {
      const { data, error } = await storage.client
        .from('training_sessions')
        .select('*')
        .order('start_date', { ascending: true });
      
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
      // Return mock data for development
      return NextResponse.json({
        data: mockTrainingSessions,
        meta: {
          total: mockTrainingSessions.length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching training sessions:', error);
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
    
    if (storage.type === 'supabase' && storage.client) {
      const { data, error } = await storage.client
        .from('training_sessions')
        .insert([body])
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { error: 'Failed to create training session' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        data: data?.[0],
        message: 'Training session created successfully'
      });
    } else {
      // Mock creation for development
      const newSession = {
        ...body,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json({
        data: newSession,
        message: 'Training session created successfully (mock)'
      });
    }
  } catch (error) {
    console.error('Error creating training session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
