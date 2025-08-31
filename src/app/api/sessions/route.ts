import { NextRequest, NextResponse } from 'next/server';
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
          console.log('Using Supabase storage (production)');
          return { type: 'supabase' as const, client: supabase };
        }
      } catch (supabaseError) {
        console.log('Supabase connection test failed:', supabaseError);
      }
    }
    
    // Use local storage for development if explicitly requested
    if (isDevelopment && isLocalhost) {
      console.log('Using local storage for development');
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
  sessions: [] as any[],
  
  // Add some sample sessions for development
  init() {
    if (this.sessions.length === 0) {
      // Add sample sessions for localhost development
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.sessions = [
        {
          id: 1,
          date: tomorrow.toISOString(),
          formation: 1,
          duration: 2,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      ];
      console.log('Initialized local storage with sample session');
    }
  }
};

// Initialize local storage
localStorage.init();

// Save session
async function saveSession(session: any) {
  const storage = await getStorage();
  
  if (storage.type === 'supabase' && storage.client) {
    const { data, error } = await storage.client
      .from('sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } else {
    localStorage.sessions.push(session);
    return session;
  }
}

// Load all sessions
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
    return [...localStorage.sessions];
  }
}

// Get single session
async function getSession(id: number) {
  const storage = await getStorage();
  
  if (storage.type === 'supabase' && storage.client) {
    const { data, error } = await storage.client
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  } else {
    return localStorage.sessions.find(s => s.id === id) || null;
  }
}

// Update session
async function updateSession(id: number, updates: any) {
  const storage = await getStorage();
  
  if (storage.type === 'supabase' && storage.client) {
    const { data, error } = await storage.client
      .from('sessions')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) return null;
    return data;
  } else {
    const index = localStorage.sessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    localStorage.sessions[index] = { ...localStorage.sessions[index], ...updates, updatedAt: new Date().toISOString() };
    return localStorage.sessions[index];
  }
}

// Delete session
async function deleteSession(id: number) {
  const storage = await getStorage();
  
  if (storage.type === 'supabase' && storage.client) {
    const { error } = await storage.client
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
    }
  } else {
    const index = localStorage.sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      localStorage.sessions.splice(index, 1);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    // Validate required fields
    if (!data.date || !data.formation) {
      return NextResponse.json(
        { error: 'Date and formation are required' },
        { status: 400 }
      );
    }

    // Create new session
    const newSession = {
      id: Date.now(), // Simple ID generation
      date: data.date,
      formation: data.formation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save session
    const savedSession = await saveSession(newSession);

    console.log('Session created:', savedSession);

    return NextResponse.json({
      success: true,
      data: savedSession
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessions = await loadSessions();
    
    return NextResponse.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updatedSession = await updateSession(id, data);
    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSession
    });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await deleteSession(parseInt(id));

    return NextResponse.json({
      success: true,
      data: { id: parseInt(id) }
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
