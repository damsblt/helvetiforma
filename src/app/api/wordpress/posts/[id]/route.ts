import { NextRequest, NextResponse } from 'next/server';
import { getWordPressPostById } from '@/lib/wordpress';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('🔍 API - Loading article with ID:', id);
    
    const article = await getWordPressPostById(id);
    
    if (article) {
      console.log('✅ API - Article found:', article.title);
      return NextResponse.json(article);
    } else {
      console.log('❌ API - Article not found');
      return NextResponse.json(
        { error: 'Article non trouvé' }, 
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('❌ API - Error loading article:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de l\'article' }, 
      { status: 500 }
    );
  }
}

