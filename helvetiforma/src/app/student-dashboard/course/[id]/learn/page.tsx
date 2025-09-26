'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  date: string;
  modified: string;
  author: any;
  guid: string;
  thumbnail_url: string | null;
  meta: {
    course_duration: string;
    course_level: string;
    course_price: string;
    course_rating: number;
    course_rating_count: number;
    course_students_count: number;
    course_thumbnail: string | null;
    course_categories: string[];
    course_tags: string[];
    course_benefits: string[];
    course_requirements: string[];
    course_target_audience: string[];
    course_material_includes: string[];
    course_settings: any;
    course_price_type: string[];
  };
}

interface Topic {
  id: number;
  title: string;
  content: string;
  course_id: number;
  order: number;
  duration: string;
  is_preview: boolean;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  order: number;
  duration: string;
  video: {
    source_type: string | null;
    source: string | null;
    runtime: {
      hours: number;
      minutes: number;
      seconds: number;
    } | null;
  };
  video_url: string | null;
  attachments: (string | number)[];
  thumbnail_id: number | null;
  lesson_author: number | null;
  is_preview: boolean;
  is_completed: boolean;
  // Additional metadata
  post_title: string;
  post_content: string;
  post_author: number;
  post_date: string;
  post_modified: string;
  post_status: string;
  guid: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  topic_id: number;
  questions: QuizQuestion[];
  passing_grade: number;
  time_limit: number;
  attempts_allowed: number;
  feedback_mode: string;
  questions_order: string;
  max_questions: number;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  title: string;
  type: string;
  description: string;
  explanation: string;
  mark: number;
  required: boolean;
  randomize: boolean;
  show_mark: boolean;
  options: string[];
  correct_answer: any;
  matching_options?: {
    left: string[];
    right: string[];
  };
  question?: string; // For fill-in-the-blank
}

export default function CourseLearnPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo data for courses without content
  const demoTopics: Topic[] = [
    {
      id: 1,
      title: 'Introduction à la Gestion des Salaires',
      content: 'Comprendre les bases de la gestion des salaires et les obligations légales',
      course_id: parseInt(params.id as string),
      order: 1,
      duration: '30 min',
      is_preview: false
    },
    {
      id: 2,
      title: 'Calcul des Salaires Bruts et Nets',
      content: 'Apprendre à calculer les salaires bruts et nets selon la législation suisse',
      course_id: parseInt(params.id as string),
      order: 2,
      duration: '45 min',
      is_preview: false
    },
    {
      id: 3,
      title: 'Charges Sociales et Cotisations',
      content: 'Maîtriser le calcul des charges sociales et des cotisations obligatoires',
      course_id: parseInt(params.id as string),
      order: 3,
      duration: '40 min',
      is_preview: false
    }
  ];

  const demoLessons: Lesson[] = [
    {
      id: 1,
      title: 'Les Bases de la Gestion des Salaires',
      content: '<h2>Introduction</h2><p>La gestion des salaires est un aspect crucial de la gestion des ressources humaines. Ce cours vous permettra de maîtriser tous les aspects de la gestion des salaires en Suisse.</p><h3>Objectifs d\'apprentissage</h3><ul><li>Comprendre la législation suisse sur les salaires</li><li>Maîtriser le calcul des salaires bruts et nets</li><li>Connaître les charges sociales obligatoires</li></ul>',
      topic_id: 1,
      order: 1,
      duration: '5min 30s',
      video: {
        source_type: 'youtube',
        source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        runtime: {
          hours: 0,
          minutes: 5,
          seconds: 30
        }
      },
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      attachments: [110, 111],
      thumbnail_id: 1,
      lesson_author: 1,
      is_preview: true,
      is_completed: false,
      post_title: 'Les Bases de la Gestion des Salaires',
      post_content: '<h2>Introduction</h2><p>La gestion des salaires est un aspect crucial de la gestion des ressources humaines.</p>',
      post_author: 1,
      post_date: '2024-01-01 10:00:00',
      post_modified: '2024-01-01 10:00:00',
      post_status: 'publish',
      guid: 'demo-lesson-1'
    },
    {
      id: 2,
      title: 'Obligations Légales',
      content: '<h2>Obligations Légales</h2><p>En Suisse, la gestion des salaires est encadrée par plusieurs lois et ordonnances.</p><h3>Lois Applicables</h3><ul><li>Code des obligations (CO)</li><li>Loi sur le travail (LTr)</li><li>Ordonnance sur la protection des travailleurs (OPTr)</li></ul>',
      topic_id: 1,
      order: 2,
      duration: '3min 15s',
      video: {
        source_type: null,
        source: null,
        runtime: null
      },
      video_url: null,
      attachments: [112],
      thumbnail_id: 2,
      lesson_author: 1,
      is_preview: false,
      is_completed: false,
      post_title: 'Obligations Légales',
      post_content: '<h2>Obligations Légales</h2><p>En Suisse, la gestion des salaires est encadrée par plusieurs lois et ordonnances.</p>',
      post_author: 1,
      post_date: '2024-01-01 10:00:00',
      post_modified: '2024-01-01 10:00:00',
      post_status: 'publish',
      guid: 'demo-lesson-2'
    },
    {
      id: 3,
      title: 'Calcul du Salaire Brut',
      content: '<h2>Calcul du Salaire Brut</h2><p>Le salaire brut est la base de tous les calculs. Il comprend le salaire de base plus les éventuelles primes et indemnités.</p><h3>Formule de Base</h3><p>Salaire Brut = Salaire de Base + Primes + Indemnités</p>',
      topic_id: 2,
      order: 1,
      duration: '8min 15s',
      video: {
        source_type: 'youtube',
        source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        runtime: {
          hours: 0,
          minutes: 8,
          seconds: 15
        }
      },
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      attachments: [113, 114],
      thumbnail_id: 3,
      lesson_author: 1,
      is_preview: true,
      is_completed: false,
      post_title: 'Calcul du Salaire Brut',
      post_content: '<h2>Calcul du Salaire Brut</h2><p>Le salaire brut est la base de tous les calculs.</p>',
      post_author: 1,
      post_date: '2024-01-01 10:00:00',
      post_modified: '2024-01-01 10:00:00',
      post_status: 'publish',
      guid: 'demo-lesson-3'
    }
  ];

  useEffect(() => {
    if (params.id) {
      loadCourseData();
    }
  }, [params.id]);

  // Handle lesson parameter from URL
  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && lessons.length > 0) {
      const lesson = lessons.find(l => l.id === parseInt(lessonId));
      if (lesson) {
        setSelectedLesson(lesson);
        // Find the topic for this lesson
        const topic = topics.find(t => t.id === lesson.topic_id);
        if (topic) {
          setSelectedTopic(topic);
        }
      }
    }
  }, [searchParams, lessons, topics]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      const courseId = params.id;

      // Load course details
      const courseResponse = await fetch(`/api/tutor-course/${courseId}`);
      const courseResult = await courseResponse.json();
      
      if (courseResult.success) {
        setCourse(courseResult.data.course);
      } else {
        throw new Error(courseResult.error || 'Failed to load course');
      }

      // Load course topics
      const topicsResponse = await fetch(`/api/tutor-topics?course_id=${courseId}`);
      const topicsResult = await topicsResponse.json();
      
      if (topicsResult.success && topicsResult.data.topics && topicsResult.data.topics.length > 0) {
        setTopics(topicsResult.data.topics);
        setSelectedTopic(topicsResult.data.topics[0]);
        setIsDemoMode(false);
        
        // Load lessons for the first topic
        const firstTopic = topicsResult.data.topics[0];
        const lessonsResponse = await fetch(`/api/tutor-lessons?topic_id=${firstTopic.id}`);
        const lessonsResult = await lessonsResponse.json();
        
        if (lessonsResult.success && lessonsResult.data.lessons) {
          setLessons(lessonsResult.data.lessons);
          if (lessonsResult.data.lessons.length > 0) {
            setSelectedLesson(lessonsResult.data.lessons[0]);
          }
        }
      } else {
        // No real content available, use demo mode
        setTopics(demoTopics);
        setSelectedTopic(demoTopics[0]);
        setLessons(demoLessons);
        setSelectedLesson(demoLessons[0]);
        setIsDemoMode(true);
      }

      // Load course content structure
      const contentResponse = await fetch(`/api/tutor-course-contents/${courseId}`);
      const contentResult = await contentResponse.json();
      
      if (contentResult.success && contentResult.data.lessons && contentResult.data.lessons.length > 0) {
        setLessons(contentResult.data.lessons);
        setQuizzes(contentResult.data.quizzes || []);
      } else if (isDemoMode) {
        // Use demo lessons
        setLessons(demoLessons);
        setSelectedLesson(demoLessons[0]);
      }

      // Calculate progress
      const completedLessons = lessons.filter(lesson => lesson.is_completed).length;
      const totalLessons = lessons.length;
      setProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);

    } catch (err) {
      console.error('Failed to load course data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    
    if (isDemoMode) {
      // In demo mode, filter existing lessons
      const topicLessons = lessons.filter(lesson => lesson.topic_id === topic.id);
      if (topicLessons.length > 0) {
        setSelectedLesson(topicLessons[0]);
      } else {
        setSelectedLesson(null);
      }
    } else {
      // In real mode, fetch lessons for this topic
      try {
        const lessonsResponse = await fetch(`/api/tutor-lessons?topic_id=${topic.id}`);
        const lessonsResult = await lessonsResponse.json();
        
        if (lessonsResult.success && lessonsResult.data.lessons) {
          setLessons(lessonsResult.data.lessons);
          if (lessonsResult.data.lessons.length > 0) {
            setSelectedLesson(lessonsResult.data.lessons[0]);
          } else {
            setSelectedLesson(null);
          }
        }
      } catch (error) {
        console.error('Failed to load lessons for topic:', error);
        setSelectedLesson(null);
      }
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const markLessonComplete = async (lessonId: number) => {
    try {
      // Call the API to mark the lesson as complete
      const response = await fetch('/api/tutor-lesson-mark-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          user_id: 1, // Demo user ID - in real app, get from auth context
          course_id: course?.id || params.id
        }),
      });

      if (response.ok) {
        // Update local state
        setLessons(prev => prev.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, is_completed: true }
            : lesson
        ));
        
        // Recalculate progress
        const updatedLessons = lessons.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, is_completed: true }
            : lesson
        );
        const completedLessons = updatedLessons.filter(lesson => lesson.is_completed).length;
        const totalLessons = updatedLessons.length;
        setProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);
        
        console.log('Lesson marked as complete successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to mark lesson complete:', errorData);
        alert(`Erreur lors du marquage de la leçon: ${errorData.error || 'Erreur inconnue'}`);
        // Still update local state for demo purposes
        setLessons(prev => prev.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, is_completed: true }
            : lesson
        ));
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      alert(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      // Still update local state for demo purposes
      setLessons(prev => prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_completed: true }
          : lesson
      ));
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'Non spécifié';
    return duration;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-8">{error || 'Cours non trouvé'}</p>
            <Link
              href="/student-dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                {isDemoMode && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Mode Démo
                  </div>
                )}
              </div>
              <p className="text-gray-600">Progression: {Math.round(progress)}%</p>
              {isDemoMode && (
                <p className="text-sm text-blue-600 mt-1">
                  Contenu d'exemple pour démonstration
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <Link
                href={`/student-dashboard/course/${course.id}`}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour aux détails
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course Structure */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenu du cours</h2>
              
              <div className="space-y-2">
                {topics.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📚</div>
                    <p className="text-gray-600 text-sm">Aucun contenu disponible pour le moment</p>
                  </div>
                ) : (
                  topics.map((topic, index) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleTopicSelect(topic)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTopic?.id === topic.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{topic.title}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDuration(topic.duration)}
                          </p>
                        </div>
                        <svg 
                          className={`w-4 h-4 transition-transform ${
                            selectedTopic?.id === topic.id ? 'rotate-90' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                    
                    {selectedTopic?.id === topic.id && (
                      <div className="px-3 pb-3 space-y-1">
                        {lessons
                          .filter(lesson => lesson.topic_id === topic.id)
                          .sort((a, b) => a.order - b.order)
                          .map(lesson => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{lesson.title}</span>
                                <div className="flex items-center space-x-1">
                                  {lesson.is_completed && (
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {topics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Contenu en cours de préparation
                </h2>
                <p className="text-gray-600 mb-6">
                  Ce cours n'a pas encore de contenu disponible. Les leçons seront ajoutées prochainement.
                </p>
                <Link
                  href={`/student-dashboard/course/${course.id}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour aux détails du cours
                </Link>
              </div>
            ) : selectedLesson ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Lesson Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDuration(selectedLesson.duration)}
                      </span>
                      {selectedLesson.is_completed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Terminé
                        </span>
                      ) : (
                        <button
                          onClick={() => markLessonComplete(selectedLesson.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Marquer comme terminé
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  {(selectedLesson.video_url || selectedLesson.video?.source) && (
                    <div className="mb-6">
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        {selectedLesson.video_url && selectedLesson.video_url.includes('youtube.com') ? (
                          <iframe
                            src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                            title={selectedLesson.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l8-5-8-5z"/>
                              </svg>
                              <p className="text-lg font-medium">Vidéo de la leçon</p>
                              <p className="text-sm text-gray-300">
                                {selectedLesson.video?.source_type?.toUpperCase() || 'VIDÉO'} • {selectedLesson.duration}
                              </p>
                              {selectedLesson.video_url && (
                                <div className="mt-4 space-y-2">
                                  <a
                                    href={selectedLesson.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Ouvrir la vidéo
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="prose max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: (selectedLesson.content || 'Contenu de la leçon non disponible.')
                          .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
                          .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
                      }} 
                    />
                  </div>


                  {selectedLesson.attachments && selectedLesson.attachments.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Fichiers joints ({selectedLesson.attachments.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedLesson.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={typeof attachment === 'string' ? attachment : `${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch'}/wp-content/uploads/${attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Fichier {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="p-6 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
                      const prevLesson = lessons[currentIndex - 1];
                      if (prevLesson) {
                        setSelectedLesson(prevLesson);
                      }
                    }}
                    disabled={lessons.findIndex(l => l.id === selectedLesson.id) === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Leçon précédente
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
                      const nextLesson = lessons[currentIndex + 1];
                      if (nextLesson) {
                        setSelectedLesson(nextLesson);
                      }
                    }}
                    disabled={lessons.findIndex(l => l.id === selectedLesson.id) === lessons.length - 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Leçon suivante →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sélectionnez une leçon
                </h2>
                <p className="text-gray-600">
                  Choisissez une leçon dans le menu de gauche pour commencer l'apprentissage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
