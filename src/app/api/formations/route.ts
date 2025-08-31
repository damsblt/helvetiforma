import { NextResponse } from 'next/server';

// Mock formations data (in production, this would come from WordPress or database)
const formations = [
  {
    id: 1,
    attributes: {
      title: "Formation Salaires",
      Theme: "Salaire",
      description: "Formation complète sur la gestion des salaires",
      type: "presentiel"
    }
  },
  {
    id: 2,
    attributes: {
      title: "Charges Sociales",
      Theme: "Assurances sociales",
      description: "Formation sur les charges sociales et assurances",
      type: "presentiel"
    }
  },
  {
    id: 3,
    attributes: {
      title: "Impôt à la Source",
      Theme: "Impôt à la source",
      description: "Formation sur l'impôt à la source",
      type: "ligne"
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
