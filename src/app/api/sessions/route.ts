import { NextRequest, NextResponse } from 'next/server';
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

// Local fallback storage
let localSessions: any[] = [];

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
    // eslint-disable-next-line prefer-const
    localSessions.push(session);
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
    return [...localSessions];
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
    return localSessions.find(s => s.id === id) || null;
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
    const index = localSessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    // eslint-disable-next-line prefer-const
    localSessions[index] = { ...localSessions[index], ...updates, updatedAt: new Date().toISOString() };
    return localSessions[index];
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
    const index = localSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      // eslint-disable-next-line prefer-const
      localSessions.splice(index, 1);
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
