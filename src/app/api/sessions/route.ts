import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// File path for storing sessions data
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(SESSIONS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load sessions from file
async function loadSessions() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Save sessions to file
async function saveSessions(sessions: any[]) {
  try {
    await ensureDataDir();
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error('Error saving sessions:', error);
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

    // Load existing sessions
    const sessions = await loadSessions();

    // Create new session
    const newSession = {
      id: Date.now(), // Simple ID generation
      date: data.date,
      formation: data.formation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to sessions array
    sessions.push(newSession);

    // Save to file
    await saveSessions(sessions);

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

    const sessions = await loadSessions();
    const sessionIndex = sessions.findIndex((s: any) => s.id === id);
    
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Save to file
    await saveSessions(sessions);

    return NextResponse.json({
      success: true,
      data: sessions[sessionIndex]
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

    const sessions = await loadSessions();
    const sessionIndex = sessions.findIndex((s: any) => s.id === parseInt(id));
    
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Remove session
    const deletedSession = sessions.splice(sessionIndex, 1)[0];

    // Save to file
    await saveSessions(sessions);

    return NextResponse.json({
      success: true,
      data: deletedSession
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
