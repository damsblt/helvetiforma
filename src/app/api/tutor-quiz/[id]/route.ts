import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: quizId } = resolvedParams;

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/quizzes/${quizId}`;
    console.log('Fetching quiz from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor quiz API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération du quiz',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Quiz fetched successfully:', responseData.data?.quiz_title || 'Unknown title');

    // Extract quiz from the response data
    const quiz = responseData.data || responseData;

    // Transform the data to match our expected format
    const transformedQuiz = {
      id: quiz.ID || quiz.id,
      title: quiz.quiz_title || quiz.post_title || quiz.title,
      description: quiz.quiz_description || quiz.post_content || quiz.description,
      topic_id: quiz.topic_id || quiz.post_parent,
      author: quiz.quiz_author || quiz.post_author,
      options: quiz.quiz_options || {},
      time_limit: quiz.quiz_options?.time_limit || null,
      feedback_mode: quiz.quiz_options?.feedback_mode || 'default',
      attempts_allowed: quiz.quiz_options?.attempts_allowed || 0,
      passing_grade: quiz.quiz_options?.passing_grade || 0,
      max_questions: quiz.quiz_options?.max_questions_for_answer || 0,
      questions_order: quiz.quiz_options?.questions_order || 'rand',
      // Additional fields
      post_title: quiz.post_title || quiz.title,
      post_content: quiz.post_content || quiz.description,
      post_author: quiz.post_author || quiz.quiz_author,
      post_date: quiz.post_date || quiz.date,
      post_modified: quiz.post_modified || quiz.modified,
      post_status: quiz.post_status || quiz.status,
      guid: quiz.guid
    };

    return NextResponse.json({
      success: true,
      data: {
        quiz: transformedQuiz
      }
    });

  } catch (error) {
    console.error('Tutor quiz API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
