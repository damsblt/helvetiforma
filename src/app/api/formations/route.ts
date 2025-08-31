import { NextResponse } from 'next/server';

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
      estimatedDuration: 2,
      sessions: [
        {
          id: 1,
          attributes: {
            date: "2025-09-01T10:30:00.000Z",
            formation: 1
          }
        },
        {
          id: 2,
          attributes: {
            date: "2025-09-03T14:00:00.000Z",
            formation: 1
          }
        }
      ]
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
      estimatedDuration: 3,
      sessions: [
        {
          id: 3,
          attributes: {
            date: "2025-09-02T09:00:00.000Z",
            formation: 2
          }
        }
      ]
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
      estimatedDuration: 2,
      sessions: [
        {
          id: 4,
          attributes: {
            date: "2025-09-04T11:00:00.000Z",
            formation: 3
          }
        }
      ]
    }
  }
];

export async function GET() {
  try {
    // Simulate WordPress API response format
    return NextResponse.json({
      data: formations,
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
