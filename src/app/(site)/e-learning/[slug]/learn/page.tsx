'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Play, CheckCircle, Lock, Clock, Video, FileText, HelpCircle, Download, Share2 } from 'lucide-react';
import { TutorCourse, TutorLesson, getTutorCourse, getTutorCourseLessons } from '@/lib/tutor-lms';
import { useAuth } from '@/contexts/AuthContext';

export default function CourseLearnPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<TutorCourse | null>(null);
  const [lessons, setLessons] = useState<TutorLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<TutorLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 [Learn Page] Loading data...', { slug, user: user?.id });
        setLoading(true);
        setAccessLoading(true);

        // Load course and lessons data
        const [courseData, lessonsData] = await Promise.all([
          getTutorCourse(slug),
          getTutorCourseLessons(slug)
        ]);

        if (courseData) {
          console.log('📚 [Learn Page] Course loaded:', courseData.id, courseData.title);
          setCourse(courseData);
        }
        console.log('📖 [Learn Page] Lessons loaded:', lessonsData.length);
        setLessons(lessonsData);
        
        // Set first lesson as active if available
        if (lessonsData.length > 0) {
          setActiveLesson(lessonsData[0]);
        }

        // Check access after course is loaded
        if (courseData && user) {
          try {
            console.log('🔐 [Learn Page] Checking access for user:', user.id, 'course:', courseData.id);
            const response = await fetch(`/api/check-course-access?userId=${user.id}&courseId=${courseData.id}`);
            const accessData = await response.json();
            console.log('🔍 [Learn Page] Access check result:', accessData);
            setHasAccess(accessData.hasAccess || false);
          } catch (error) {
            console.error('❌ [Learn Page] Error checking course access:', error);
            setHasAccess(false);
          }
        } else {
          console.warn('⚠️ [Learn Page] No user or course data, denying access', { courseData: !!courseData, user: !!user });
          setHasAccess(false);
        }
      } catch (error) {
        console.error('❌ [Learn Page] Error loading course data:', error);
        setHasAccess(false);
      } finally {
        console.log('✅ [Learn Page] Load complete. hasAccess:', hasAccess);
        setLoading(false);
        setAccessLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug, user]);

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case 'video':
        return Video;
      case 'quiz':
        return HelpCircle;
      case 'assignment':
        return FileText;
      default:
        return BookOpen;
    }
  };

  const markLessonComplete = (lessonId: number) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return 'Durée non spécifiée';
    return duration;
  };

  console.log('🎨 [Learn Page] Render state:', { loading, accessLoading, hasAccess, hasCourse: !!course, hasUser: !!user });

  if (loading || accessLoading) {
    console.log('⏳ [Learn Page] Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    console.log('❌ [Learn Page] Rendering no course state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formation non trouvée</h1>
          <p className="text-gray-600 mb-6">Cette formation n'existe pas ou a été supprimée.</p>
          <Link
            href="/e-learning"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    console.log('🔒 [Learn Page] Rendering access denied state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès restreint
          </h1>
          
          <p className="text-gray-600 mb-6">
            Vous devez être inscrit à cette formation pour y accéder.
          </p>
          
          <div className="space-y-3">
            <Link
              href={`/e-learning/${course.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir la formation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ [Learn Page] Rendering course content');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/e-learning/${course.slug}`}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Formation en cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenu du cours</h3>
              
              <div className="space-y-4">
                {/* Progress */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
                    <span>Progression</span>
                    <span>{Math.round((completedLessons.size / lessons.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((completedLessons.size / lessons.length) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    Leçons ({lessons.length})
                  </h4>
                  {lessons.length > 0 ? (
                    lessons.map((lesson, index) => {
                      const Icon = getLessonIcon(lesson.lesson_type);
                      const isCompleted = completedLessons.has(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            isActive
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Icon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isCompleted ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {lesson.duration && (
                                <p className="text-xs text-gray-500">{lesson.duration}</p>
                              )}
                              <span className="text-xs text-gray-400">
                                Leçon {index + 1}
                              </span>
                            </div>
                          </div>
                          {lesson.is_preview && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Aperçu
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Aucune leçon disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeLesson ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Lesson Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{activeLesson.title}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(activeLesson.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>Leçon {lessons.findIndex(l => l.id === activeLesson.id) + 1} sur {lessons.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => markLessonComplete(activeLesson.id)}
                      disabled={completedLessons.has(activeLesson.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        completedLessons.has(activeLesson.id)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {completedLessons.has(activeLesson.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Terminé
                        </>
                      ) : (
                        'Marquer comme terminé'
                      )}
                    </button>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  {/* Video Content */}
                  {activeLesson.video_url && (
                    <div className="aspect-video bg-gray-900 rounded-lg mb-6 overflow-hidden">
                      <iframe
                        src={activeLesson.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        title={activeLesson.title}
                      />
                    </div>
                  )}
                  
                  {/* Text Content */}
                  <div className="prose max-w-none mb-6">
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: activeLesson.content || '' }}
                    />
                    {!activeLesson.content && (
                      <p className="text-gray-600">
                        Contenu de la leçon: {activeLesson.title}
                      </p>
                    )}
                  </div>
                  
                  {/* Attachments */}
                  {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Documents et ressources
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeLesson.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {attachment.mime_type?.startsWith('image/') ? (
                                  <FileText className="w-6 h-6 text-blue-500" />
                                ) : attachment.mime_type?.includes('pdf') ? (
                                  <FileText className="w-6 h-6 text-red-500" />
                                ) : attachment.mime_type?.includes('video') ? (
                                  <Video className="w-6 h-6 text-purple-500" />
                                ) : (
                                  <Download className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.title}
                                </h4>
                                {attachment.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {attachment.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span>{attachment.mime_type}</span>
                                  {attachment.file_size > 0 && (
                                    <span>• {(attachment.file_size / 1024 / 1024).toFixed(1)} MB</span>
                                  )}
                                </div>
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Télécharger
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                        if (currentIndex > 0) {
                          setActiveLesson(lessons[currentIndex - 1]);
                        }
                      }}
                      disabled={lessons.findIndex(l => l.id === activeLesson.id) === 0}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Leçon précédente
                    </button>
                    
                    <button
                      onClick={() => {
                        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                        if (currentIndex < lessons.length - 1) {
                          setActiveLesson(lessons[currentIndex + 1]);
                        }
                      }}
                      disabled={lessons.findIndex(l => l.id === activeLesson.id) === lessons.length - 1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Leçon suivante →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez une leçon
                </h3>
                <p className="text-gray-600">
                  Choisissez une leçon dans le menu de gauche pour commencer.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}