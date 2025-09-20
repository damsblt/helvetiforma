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

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/quiz-question-answer/${quizId}`;
    console.log('Fetching quiz questions from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor quiz questions API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération des questions du quiz',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Quiz questions fetched successfully:', responseData.data?.length || 'Unknown count');

    // Extract questions from the response data
    const questions = responseData.data || [];

    // Transform the data to match our expected format
    const transformedQuestions = questions.map((question: any) => ({
      id: question.question_id || question.id,
      quiz_id: question.quiz_id || quizId,
      title: question.question_title || question.title,
      type: question.question_type || question.type,
      description: question.question_description || question.description,
      explanation: question.answer_explanation || question.explanation,
      mark: question.question_mark || question.mark || 1,
      required: question.answer_required || question.required || true,
      randomize: question.randomize_question || question.randomize || false,
      show_mark: question.show_question_mark || question.show_mark || true,
      // Question-specific fields
      options: question.options || [],
      correct_answer: question.correct_answer,
      matching_options: question.matching_options || null,
      question: question.question || question.title, // For fill-in-the-blank
      // Additional fields
      answer_required: question.answer_required || true,
      question_mark: question.question_mark || 1,
      show_question_mark: question.show_question_mark || true,
      answer_explanation: question.answer_explanation || '',
      question_description: question.question_description || ''
    }));

    return NextResponse.json({
      success: true,
      data: {
        questions: transformedQuestions
      }
    });

  } catch (error) {
    console.error('Tutor quiz questions API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
