import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// File path for storing sessions data
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');

// Load sessions from file
async function loadSessions() {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn't exist or is invalid, return empty array
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
    // Load sessions from file
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
