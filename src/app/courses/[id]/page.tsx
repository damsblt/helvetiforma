'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { tutorService } from '@/services/tutorService';
import { authService } from '@/services/authService';
import CartButton from '@/components/CartButton';
import type { TutorCourse, TutorLesson, TutorEnrollment } from '@/types/tutor';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.id as string);
  
  const [course, setCourse] = useState<TutorCourse | null>(null);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [lessons, setLessons] = useState<TutorLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [userEnrollment, setUserEnrollment] = useState<TutorEnrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [showCourseContent, setShowCourseContent] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    has_purchased: boolean,
    has_enrollment: boolean,
    has_access: boolean
  } | null>(null);

  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true);
        const [courseData, curriculumData] = await Promise.all([
          tutorService.getCourse(courseId),
          tutorService.getCourseCurriculum(courseId)
        ]);
        
        setCourse(courseData);
        setCurriculum(curriculumData);
        
        // Check purchase status and enrollment
        if (isAuthenticated && user) {
          try {
            // Check purchase status first
            const purchaseInfo = await tutorService.checkPurchaseStatus(courseId);
            setPurchaseStatus(purchaseInfo);
            
            // Then check enrollments
            const enrollments = await tutorService.getUserEnrollments();
            const enrollment = enrollments.find(e => e.course_id === courseId);
            setUserEnrollment(enrollment || null);
            
            // Show course content only if user has proper access
            const hasProperAccess = courseData?.is_free ? 
              (purchaseInfo.has_access || enrollment) : // Free courses: enrollment OR purchase
              purchaseInfo.has_purchased; // Paid courses: must have purchased
              
            if (hasProperAccess) {
              setShowCourseContent(true);
              // Set first lesson as current lesson
              if (curriculumData?.topics?.[0]?.lessons?.[0]) {
                setCurrentLesson(curriculumData.topics[0].lessons[0]);
              }
            }
          } catch (accessError) {
            console.warn('Could not load access data:', accessError);
          }
        }
        
        // Extract lessons from curriculum for backward compatibility
        if (curriculumData && curriculumData.topics) {
          const extractedLessons = await tutorService.getCourseLessons(courseId);
          setLessons(extractedLessons);
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Erreur lors du chargement du cours');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/tutor-login');
      return;
    }

    try {
      setIsEnrolling(true);
      
      if (course?.is_free) {
        const success = await tutorService.enrollInCourse(courseId);
        if (success) {
          // Create enrollment object
          const newEnrollment: TutorEnrollment = {
            id: Date.now(),
            user_id: user!.id,
            course_id: courseId,
            status: 'enrolled',
            enrolled_at: new Date().toISOString(),
            progress: 0
          };
          
          setUserEnrollment(newEnrollment);
          setShowCourseContent(true);
          
          // Set first lesson as current lesson
          if (curriculum?.topics?.[0]?.lessons?.[0]) {
            setCurrentLesson(curriculum.topics[0].lessons[0]);
          }
          
          alert('Inscription réussie ! Vous pouvez maintenant accéder au cours.');
        } else {
          alert('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      } else {
        // Redirect to purchase flow
        const result = await tutorService.purchaseCourse(courseId);
        if (result.success && result.redirect_url) {
          window.location.href = result.redirect_url;
        } else {
          alert('Erreur lors du processus d\'achat. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      // Redirect to Tutor LMS cart with course
      window.location.href = `/panier?add-to-cart=${courseId}`;
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cours non trouvé</h1>
            <p className="text-gray-600 mb-6">{error || 'Ce cours n\'existe pas ou n\'est plus disponible.'}</p>
            <Link 
              href="/formations"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If has access and showing course content, render the course player
  // For paid courses, require purchase. For free courses, enrollment is enough.
  const hasValidAccess = course?.is_free ? 
    (purchaseStatus?.has_access || userEnrollment) : 
    purchaseStatus?.has_purchased;
    
  if (showCourseContent && hasValidAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar - Course Navigation */}
          <div className="w-80 bg-white shadow-lg h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setShowCourseContent(false)}
                  className="text-gray-500 hover:text-gray-700 mr-3"
                >
                  ← Retour
                </button>
                <h2 className="text-lg font-semibold text-gray-900 truncate">{course.title}</h2>
              </div>
              
              {/* Course Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium text-gray-900">{userEnrollment?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${userEnrollment?.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Course Curriculum */}
              <div className="space-y-4">
                {curriculum?.topics?.map((topic: any, topicIndex: number) => (
                  <div key={topic.topic_id} className="border rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium text-gray-900">{topic.topic_title}</h3>
                    </div>
                    <div className="divide-y">
                      {topic.lessons?.map((lesson: any, lessonIndex: number) => (
                        <button
                          key={lesson.lesson_id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            currentLesson?.lesson_id === lesson.lesson_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {lesson.lesson_type === 'video' ? (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M9 4h6l-6 16H3l6-16z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lesson.lesson_title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {lesson.lesson_type}
                                {lesson.preview && ' • Aperçu'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8">
            {currentLesson ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{currentLesson.lesson_title}</h1>
                
                {currentLesson.lesson_type === 'video' ? (
                  <div className="mb-6">
                    <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center text-white">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M9 4h6l-6 16H3l6-16z" />
                        </svg>
                        <p className="text-lg">Contenu vidéo</p>
                        <p className="text-sm text-gray-300">Le contenu détaillé sera disponible après intégration complète</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700">
                        Contenu de la leçon: <strong>{currentLesson.lesson_title}</strong>
                      </p>
                      <p className="text-gray-600">
                        Cette leçon de type <em>{currentLesson.lesson_type}</em> contiendra le contenu pédagogique 
                        une fois l'intégration avec WordPress sera complète.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <p className="text-blue-800 text-sm">
                          💡 <strong>Cours intégré</strong> - Vous visualisez maintenant le contenu du cours 
                          directement dans l'application HelvetiForma sans quitter la plateforme.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <button className="text-gray-500 hover:text-gray-700 font-medium">
                    ← Leçon précédente
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Marquer comme terminée
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 font-medium">
                    Leçon suivante →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bienvenue dans le cours</h2>
                <p className="text-gray-600 mb-6">Sélectionnez une leçon dans le menu de gauche pour commencer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default course info view for non-enrolled users
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec titre et catégorie */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
          
          {/* Catégorie et boutons de partage */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {course.categories.length > 0 ? course.categories[0].name : 'Formation'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <span className="text-sm">Liste de souhaits</span>
              </button>
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <span className="text-sm">Partager</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation par onglets */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button className="border-b-2 border-blue-500 py-2 px-1 text-blue-600 font-medium text-sm">
                  Infos sur le cours
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Avis
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Plus
                </button>
              </nav>
            </div>

            {/* À propos du cours */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">À propos du cours</h2>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: course.content }}
              />
            </div>

            {/* Qu'allez-vous apprendre */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Qu'allez-vous apprendre ?</h3>
              <ul className="space-y-2">
                {course.excerpt && (
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <div dangerouslySetInnerHTML={{ __html: course.excerpt }} />
                  </li>
                )}
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Maîtriser les concepts fondamentaux de la formation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Appliquer les connaissances dans des situations pratiques</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Développer des compétences professionnelles reconnues</span>
                </li>
              </ul>
            </div>

            {/* Contenu du cours */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contenu du cours</h3>
              {curriculum && curriculum.topics ? (
                <div className="space-y-4">
                  {curriculum.topics.map((topic: any, topicIndex: number) => (
                    <div key={topic.topic_id || topicIndex} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900">
                          Topic {topicIndex + 1}: {topic.topic_title || `Module ${topicIndex + 1}`}
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {/* Lessons */}
                          {topic.lessons && topic.lessons.map((lesson: any, lessonIndex: number) => (
                            <div key={lesson.lesson_id || lessonIndex} className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">
                                {lesson.lesson_type === 'video' ? '🎥' : '📚'}
                              </span>
                              <span className="flex-1">{lesson.lesson_title || `Leçon ${lessonIndex + 1}`}</span>
                              {lesson.is_preview && (
                                <span className="text-green-600 text-xs font-medium">Aperçu gratuit</span>
                              )}
                            </div>
                          ))}
                          
                          {/* Quizzes */}
                          {topic.quizzes && topic.quizzes.map((quiz: any, quizIndex: number) => (
                            <div key={quiz.quiz_id || quizIndex} className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">🧩</span>
                              <span>{quiz.quiz_title || `Quiz ${quizIndex + 1}`}</span>
                            </div>
                          ))}
                          
                          {/* Assignments */}
                          {topic.assignments && topic.assignments.map((assignment: any, assignmentIndex: number) => (
                            <div key={assignment.assignment_id || assignmentIndex} className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">📝</span>
                              <span>{assignment.assignment_title || `Devoir ${assignmentIndex + 1}`}</span>
                            </div>
                          ))}
                          
                          {/* Empty topic fallback */}
                          {(!topic.lessons || topic.lessons.length === 0) && 
                           (!topic.quizzes || topic.quizzes.length === 0) && 
                           (!topic.assignments || topic.assignments.length === 0) && (
                            <>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">📚</span>
                                <span>Lesson 1: Introduction</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">📚</span>
                                <span>Lesson 2: Concepts et pratique</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">🧩</span>
                                <span>Quiz d'évaluation</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">Le contenu détaillé du cours sera disponible après inscription.</p>
                  <p className="text-sm text-gray-500">
                    Ce cours comprend des leçons interactives, des exercices pratiques et des évaluations.
                  </p>
                </div>
              )}
            </div>

            {/* Notes et avis */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Notes et avis de l'apprenant</h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Encore aucun avis !</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Prix et achat */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {course.is_free ? 'Gratuit' : formatPrice(course.price || 0)}
                    </span>
                    {course.sale_price && course.sale_price < (course.price || 0) && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(course.sale_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Access button logic based on course type and purchase status */}
                {(() => {
                  // For free courses: show access if enrolled or has access
                  if (course.is_free && (purchaseStatus?.has_access || userEnrollment)) {
                    return (
                      <button
                        onClick={() => setShowCourseContent(true)}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium mb-4"
                      >
                        🚀 Accéder au cours
                      </button>
                    );
                  }
                  
                  // For paid courses: show access only if purchased
                  if (!course.is_free && purchaseStatus?.has_purchased) {
                    return (
                      <button
                        onClick={() => setShowCourseContent(true)}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium mb-4"
                      >
                        🚀 Accéder au cours
                      </button>
                    );
                  }
                  
                  // For free courses: show enrollment button
                  if (course.is_free) {
                    return (
                      <button
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                      >
                        {isEnrolling ? 'Inscription en cours...' : 'S\'inscrire gratuitement'}
                      </button>
                    );
                  }
                  
                  // For paid courses: show add to cart button (new e-commerce flow)
                  return (
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-blue-600">{course.price} CHF</span>
                        {course.sale_price && (
                          <span className="text-lg text-gray-500 line-through ml-2">{course.sale_price} CHF</span>
                        )}
                      </div>
                      <CartButton
                        courseId={course.id}
                        courseTitle={course.title}
                        coursePrice={course.price || 0}
                        courseSalePrice={course.sale_price}
                        courseSlug={course.slug}
                        courseFeaturedImage={course.featured_image}
                        className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                      >
                        🛒 Ajouter au panier
                      </CartButton>
                    </div>
                  );
                })()}

                {/* Purchase Status Debug Info (remove in production) */}
                {purchaseStatus && isAuthenticated && (
                  <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded">
                    <strong>Status:</strong> Purchased: {purchaseStatus.has_purchased ? '✅' : '❌'}, 
                    Enrolled: {purchaseStatus.has_enrollment ? '✅' : '❌'}, 
                    Access: {purchaseStatus.has_access ? '✅' : '❌'}
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="text-sm text-gray-600 text-center mb-4">
                    <Link href="/tutor-login" className="text-blue-600 hover:text-blue-700">
                      Connectez-vous
                    </Link> ou{' '}
                    <Link href="/inscription-des-apprenants" className="text-blue-600 hover:text-blue-700">
                      créez un compte
                    </Link>
                  </p>
                )}

                {/* Informations sur le cours */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Niveau:</span>
                    <span className="font-medium">{course.difficulty_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total des inscrits:</span>
                    <span className="font-medium">{course.enrolled_students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière mise à jour:</span>
                    <span className="font-medium">{new Date(course.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Un cours de */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Un cours de</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {course.instructor.firstName?.[0] || course.instructor.username?.[0] || 'G'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {course.instructor.firstName && course.instructor.lastName 
                        ? `${course.instructor.firstName} ${course.instructor.lastName}`
                        : course.instructor.username
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Ce matériel inclut */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ce matériel inclut</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{course.lessons_count || 15} Additional resources</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Available from the app</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Certificate of Completion</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
