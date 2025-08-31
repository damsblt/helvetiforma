import { NextRequest, NextResponse } from 'next/server';

// Mock data store for sessions (in production, this would be a database)
const sessions: any[] = [];

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

    // Add to sessions array
    sessions.push(newSession);

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

    const sessionIndex = sessions.findIndex(s => s.id === id);
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

    const sessionIndex = sessions.findIndex(s => s.id === parseInt(id));
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Remove session
    const deletedSession = sessions.splice(sessionIndex, 1)[0];

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
