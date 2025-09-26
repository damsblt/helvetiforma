import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Enhanced storage detection with environment awareness
async function getStorage() {
  try {
    // Check if we're in development/localhost
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';
    
    // Try to use Supabase first (production priority)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        // Test the connection
        const { data, error } = await supabase.from('sessions').select('count').limit(1);
        if (!error) {
          console.log('Using Supabase for formations (production)');
          return { type: 'supabase' as const, client: supabase };
        }
      } catch (supabaseError) {
        console.log('Supabase connection test failed for formations:', supabaseError);
      }
    }
    
    // Use local storage for development if explicitly requested
    if (isDevelopment && isLocalhost) {
      console.log('Using local storage for formations (development)');
      return { type: 'local' as const, client: null };
    }
    
    // In production, if Supabase fails, we should fail gracefully
    if (!isDevelopment) {
      console.error('CRITICAL: Supabase connection failed in production');
      throw new Error('Database connection failed in production');
    }
    
  } catch (error) {
    console.error('Formations storage detection error:', error);
  }
  
  // Fallback to local data only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Using local formations data (development only)');
    return { type: 'local' as const, client: null };
  }
  
  // In production, we must have Supabase
  throw new Error('Supabase connection required for production');
}

// Load sessions from storage
async function loadSessions() {
  const storage = await getStorage();
  
  if (storage.type === 'supabase' && storage.client) {
    const { data, error } = await storage.client
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Supabase error:', error);
      return [];
    }
    return data || [];
  } else {
    return [];
  }
}

// Mock formations data (in production, this would come from WordPress or database)
const formations = [
  {
    id: 1,
    attributes: {
      Title: "Formation Salaires",
      Theme: "salaires",
      Description: "Formation complète sur la gestion des salaires",
      Type: "Présentiel",
      difficulty: "Intermédiaire",
      estimatedDuration: 2
    }
  },
  {
    id: 2,
    attributes: {
      Title: "Charges Sociales",
      Theme: "charges-sociales",
      Description: "Formation sur les charges sociales et assurances",
      Type: "Présentiel",
      difficulty: "Avancé",
      estimatedDuration: 3
    }
  },
  {
    id: 3,
    attributes: {
      Title: "Impôt à la Source",
      Theme: "impot-a-la-source",
      Description: "Formation sur l'impôt à la source",
      Type: "En ligne",
      difficulty: "Débutant",
      estimatedDuration: 2
    }
  }
];

export async function GET() {
  try {
    // Load sessions from storage
    const sessions = await loadSessions();

    // Merge formations with their sessions
    const formationsWithSessions = formations.map(formation => ({
      ...formation,
      attributes: {
        ...formation.attributes,
        sessions: sessions.filter((session: any) => session.formation === formation.id).map((session: any) => ({
          id: session.id,
          attributes: {
            date: session.date,
            formation: formation.id
          }
        }))
      }
    }));

    // Simulate WordPress API response format
    return NextResponse.json({
      data: formationsWithSessions,
      meta: {
        pagination: {
          page: 1,
          pageSize: 25,
          pageCount: 1,
          total: formations.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching formations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}