import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Try to use Supabase, fallback to local storage
async function getStorage() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      return { type: 'supabase' as const, client: supabase };
    }
  } catch {
    // Fallback to local storage
  }
  return { type: 'local' as const, client: null };
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
      Theme: "Salaire",
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
      Theme: "Assurances sociales",
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
      Theme: "Impôt à la source",
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
