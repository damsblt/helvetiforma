import { NextRequest, NextResponse } from 'next/server';

// Try to use Vercel KV, fallback to local storage
async function getStorage() {
  try {
    const { kv } = await import('@vercel/kv');
    return { type: 'kv' as const, client: kv };
  } catch {
    return { type: 'local' as const, client: null };
  }
}

// Local fallback storage
let localSessions: any[] = [];

// Save session
async function saveSession(session: any) {
  const storage = await getStorage();
  
  if (storage.type === 'kv' && storage.client) {
    await storage.client.hset('sessions', { [session.id.toString()]: JSON.stringify(session) });
  } else {
    localSessions.push(session);
  }
}

// Load all sessions
async function loadSessions() {
  const storage = await getStorage();
  
  if (storage.type === 'kv' && storage.client) {
    const sessionsData = await storage.client.hgetall('sessions');
    return Object.values(sessionsData || {}).map((sessionStr: any) => 
      typeof sessionStr === 'string' ? JSON.parse(sessionStr) : sessionStr
    );
  } else {
    return [...localSessions];
  }
}

// Get single session
async function getSession(id: number) {
  const storage = await getStorage();
  
  if (storage.type === 'kv' && storage.client) {
    const sessionStr = await storage.client.hget('sessions', id.toString());
    return sessionStr ? (typeof sessionStr === 'string' ? JSON.parse(sessionStr) : sessionStr) : null;
  } else {
    return localSessions.find(s => s.id === id) || null;
  }
}

// Update session
async function updateSession(id: number, updates: any) {
  const storage = await getStorage();
  
  if (storage.type === 'kv' && storage.client) {
    const existingSession = await getSession(id);
    if (!existingSession) return null;
    
    const updatedSession = { ...existingSession, ...updates, updatedAt: new Date().toISOString() };
    await storage.client.hset('sessions', { [id.toString()]: JSON.stringify(updatedSession) });
    return updatedSession;
  } else {
    const index = localSessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    localSessions[index] = { ...localSessions[index], ...updates, updatedAt: new Date().toISOString() };
    return localSessions[index];
  }
}

// Delete session
async function deleteSession(id: number) {
  const storage = await getStorage();
  
  if (storage.type === 'kv' && storage.client) {
    await storage.client.hdel('sessions', id.toString());
  } else {
    const index = localSessions.findIndex(s => s.id === id);
    if (index !== -1) {
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
    await saveSession(newSession);

    console.log('Session created:', newSession);

    return NextResponse.json({
      success: true,
      data: newSession
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
