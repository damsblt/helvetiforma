import { NextRequest, NextResponse } from 'next/server';
import { tutorService } from '@/services/tutorService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
      instructor: searchParams.get('instructor') ? parseInt(searchParams.get('instructor')!) : undefined,
    };

    const courses = await tutorService.getCourses(params);

    return NextResponse.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des cours' },
      { status: 500 }
    );
  }
}
