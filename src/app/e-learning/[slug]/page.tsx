'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  Users, 
  Play, 
  Lock, 
  CheckCircle, 
  Award, 
  Download,
  Share2,
  Heart,
  BookOpen,
  Video,
  FileText,
  HelpCircle
} from 'lucide-react';
import { TutorCourse, TutorLesson, TutorQuiz, getTutorCourse, getTutorCourseLessons, getTutorCourseQuizzes } from '@/lib/tutor-lms';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CoursePageProps {}

export default function CoursePage({}: CoursePageProps) {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [course, setCourse] = useState<TutorCourse | null>(null);
  const [lessons, setLessons] = useState<TutorLesson[]>([]);
  const [quizzes, setQuizzes] = useState<TutorQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const [courseData, lessonsData, quizzesData] = await Promise.all([
          getTutorCourse(slug),
          getTutorCourseLessons(slug),
          getTutorCourseQuizzes(slug)
        ]);

        setCourse(courseData);
        setLessons(lessonsData);
        setQuizzes(quizzesData);
        
        // Check enrollment status if user is logged in
        if (user && courseData) {
          try {
            const response = await fetch(`/api/check-course-access?userId=${user.id}&courseId=${courseData.id}`);
            const accessData = await response.json();
            setIsEnrolled(accessData.hasAccess || false);
            console.log('🔍 Course access check:', accessData);
          } catch (error) {
            console.error('Error checking course access:', error);
            setIsEnrolled(courseData?.is_enrolled || false);
          }
        } else {
          setIsEnrolled(courseData?.is_enrolled || false);
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadCourse();
    }
  }, [slug, user]);

  // Check for payment success and refresh enrollment status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const enrolled = urlParams.get('enrolled');
    
    if ((payment === 'success' || enrolled === 'true') && user && course) {
      console.log('🎉 Payment success or enrollment detected, refreshing enrollment status...');
      // Refresh enrollment status
      const checkEnrollment = async () => {
        setCheckingEnrollment(true);
        try {
          const response = await fetch(`/api/check-course-access?userId=${user.id}&courseId=${course.id}`);
          const accessData = await response.json();
          setIsEnrolled(accessData.hasAccess || false);
          console.log('🔍 Post-payment enrollment check:', accessData);
          
          // Clean up URL parameters after successful check
          if (accessData.hasAccess) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('Error checking post-payment enrollment:', error);
        } finally {
          setCheckingEnrollment(false);
        }
      };
      
      checkEnrollment();
    }
  }, [user, course]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return 'Durée non spécifiée';
    return duration;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return level;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formation non trouvée</h1>
          <p className="text-gray-600 mb-6">Cette formation n'existe pas ou a été supprimée.</p>
          <Link
            href="/e-learning"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Voir toutes les formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link href="/e-learning" className="hover:text-blue-600">Formations</Link>
                <span>/</span>
                <span className="text-gray-900">{course.title}</span>
              </nav>

              {/* Course Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.course_level || 'beginner')}`}>
                    {getLevelLabel(course.course_level || 'beginner')}
                  </span>
                </div>

                {course.rating && course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(course.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.rating.toFixed(1)} ({course.reviews_count || 0} avis)
                    </span>
                  </div>
                )}

                {course.course_duration && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDuration(course.course_duration)}</span>
                  </div>
                )}

                {course.enrolled_count && course.enrolled_count > 0 && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{course.enrolled_count} inscrits</span>
                  </div>
                )}
              </div>

              {/* Course Description */}
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: course.content }} />
              </div>
            </div>

            {/* Course Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                {/* Course Image */}
                <div className="mb-6">
                  {course.featured_image ? (
                    <img
                      src={course.featured_image}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  {course.course_price && course.course_price > 0 ? (
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(course.course_price)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      Gratuit
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {checkingEnrollment ? (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg">
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Vérification de l'inscription...
                    </div>
                  ) : isEnrolled ? (
                    <Link
                      href={`/e-learning/${course.slug}/learn`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Continuer la formation
                    </Link>
                  ) : course.course_price && course.course_price > 0 ? (
                    <Link
                      href={`/e-learning/${course.slug}/checkout`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Lock className="w-4 h-4" />
                      Acheter la formation
                    </Link>
                  ) : (
                    <button 
                      onClick={async () => {
                        if (!user) {
                          // Redirect to login with callback to checkout
                          const checkoutUrl = `/e-learning/${course.slug}/checkout`;
                          window.location.href = `/login?callbackUrl=${encodeURIComponent(checkoutUrl)}`;
                          return;
                        }
                        
                        try {
                          setCheckingEnrollment(true);
                          const response = await fetch('/api/tutor-lms/enrollments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              courseId: course.id,
                              userId: user.id,
                              amount: 0,
                              paymentMethod: 'free'
                            })
                          });
                          
                          const data = await response.json();
                          if (data.success) {
                            setIsEnrolled(true);
                            // Redirect to dashboard
                            window.location.href = `/dashboard?enrolled=true&course=${course.slug}`;
                          } else {
                            alert('❌ Erreur lors de l\'inscription: ' + (data.error || 'Erreur inconnue'));
                          }
                        } catch (error) {
                          console.error('Enrollment error:', error);
                          alert('❌ Erreur lors de l\'inscription. Veuillez réessayer.');
                        } finally {
                          setCheckingEnrollment(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Commencer gratuitement
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        isWishlisted
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      {isWishlisted ? 'Retiré' : 'Ajouter'}
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>

                {/* Course Features */}
                {course.course_benefits && course.course_benefits.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Ce que vous apprendrez</h3>
                    <ul className="space-y-2">
                      {course.course_benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Aperçu', icon: BookOpen },
                { id: 'curriculum', label: 'Programme', icon: Play },
                { id: 'instructor', label: 'Formateur', icon: Users },
                { id: 'reviews', label: 'Avis', icon: Star },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Course Description */}
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: course.content }} />
                </div>

                {/* Course Benefits */}
                {course.course_benefits && course.course_benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ce que vous apprendrez</h3>
                    <ul className="space-y-3">
                      {course.course_benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Requirements */}
                {course.course_requirements && course.course_requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prérequis</h3>
                    <ul className="space-y-3">
                      {course.course_requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Stats - Only show if we have meaningful data */}
                {((course.enrolled_count && course.enrolled_count > 0) || 
                  (course.rating && course.rating > 0) || 
                  (course.reviews_count && course.reviews_count > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    {course.enrolled_count && course.enrolled_count > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{course.enrolled_count}</div>
                        <div className="text-sm text-gray-600">Étudiants inscrits</div>
                      </div>
                    )}
                    {course.rating && course.rating > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{course.rating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Note moyenne</div>
                      </div>
                    )}
                    {course.reviews_count && course.reviews_count > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{course.reviews_count}</div>
                        <div className="text-sm text-gray-600">Avis</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Programme de la formation
                  </h3>
                  <div className="text-sm text-gray-600">
                    {lessons.length + quizzes.length} leçons • {course.course_duration || 'Durée non spécifiée'}
                  </div>
                </div>
                
                {/* Course Curriculum from API */}
                {course.course_curriculum && course.course_curriculum.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Contenu du cours</h4>
                    <div className="space-y-2">
                      {course.course_curriculum.map((lesson, index) => {
                        const Icon = getLessonIcon(lesson.lesson_type || 'lesson');
                        return (
                          <div
                            key={lesson.id || index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                              {lesson.duration && (
                                <p className="text-sm text-gray-600">{lesson.duration}</p>
                              )}
                            </div>
                            {lesson.is_preview ? (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Aperçu
                              </span>
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : lessons.length > 0 ? (
                  <div className="space-y-6">
                    {/* Group lessons by topic if available */}
                    {(() => {
                      const lessonsByTopic = lessons.reduce((acc, lesson) => {
                        const topicKey = lesson.topic_title || 'Sans catégorie';
                        if (!acc[topicKey]) {
                          acc[topicKey] = [];
                        }
                        acc[topicKey].push(lesson);
                        return acc;
                      }, {} as Record<string, typeof lessons>);

                      return Object.entries(lessonsByTopic).map(([topicTitle, topicLessons]) => (
                        <div key={topicTitle} className="space-y-3">
                          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                            {topicTitle}
                          </h4>
                          <div className="space-y-2">
                            {topicLessons.map((lesson, index) => {
                              const Icon = getLessonIcon(lesson.lesson_type || 'lesson');
                              return (
                                <div
                                  key={lesson.id || index}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <Icon className="w-5 h-5 text-gray-400" />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                                    {lesson.duration && (
                                      <p className="text-sm text-gray-600">{lesson.duration}</p>
                                    )}
                                  </div>
                                  {lesson.is_preview ? (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      Aperçu
                                    </span>
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  /* Fallback to lessons and quizzes from state */
                  <>
                    {/* Lessons */}
                    {lessons.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Leçons</h4>
                        <div className="space-y-2">
                          {lessons.map((lesson, index) => {
                            const Icon = getLessonIcon(lesson.lesson_type);
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Icon className="w-5 h-5 text-gray-400" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                                  {lesson.duration && (
                                    <p className="text-sm text-gray-600">{lesson.duration}</p>
                                  )}
                                </div>
                                {lesson.is_preview ? (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Aperçu
                                  </span>
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quizzes */}
                    {quizzes.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Quiz</h4>
                        <div className="space-y-2">
                          {quizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <HelpCircle className="w-5 h-5 text-gray-400" />
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{quiz.title}</h5>
                                <p className="text-sm text-gray-600">
                                  {quiz.questions?.length || 0} questions • {quiz.time_limit ? `${quiz.time_limit} min` : 'Sans limite'}
                                </p>
                              </div>
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No content message */}
                    {lessons.length === 0 && quizzes.length === 0 && (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Le programme de cette formation sera bientôt disponible.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="space-y-6">
                {course.course_instructors && course.course_instructors.length > 0 ? (
                  <div className="space-y-6">
                    {course.course_instructors.map((instructor, index) => (
                      <div key={instructor.id || index} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          {/* Instructor Avatar */}
                          <div className="flex-shrink-0">
                            {instructor.avatar_url ? (
                              <img
                                src={instructor.avatar_url}
                                alt={instructor.display_name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                          </div>
                          
                          {/* Instructor Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {instructor.display_name}
                            </h3>
                            
                            {instructor.bio && (
                              <p className="text-gray-700 mb-4 leading-relaxed">
                                {instructor.bio}
                              </p>
                            )}
                            
                            {/* Instructor Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{instructor.courses_count || 0} cours</span>
                              </div>
                              {instructor.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span>{instructor.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Social Links */}
                            {instructor.social_links && (
                              <div className="flex items-center gap-3">
                                {instructor.social_links.website && (
                                  <a
                                    href={instructor.social_links.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    Site web
                                  </a>
                                )}
                                {instructor.social_links.linkedin && (
                                  <a
                                    href={instructor.social_links.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    LinkedIn
                                  </a>
                                )}
                                {instructor.social_links.twitter && (
                                  <a
                                    href={instructor.social_links.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    Twitter
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Informations sur le formateur
                    </h3>
                    <p className="text-gray-600">
                      Les détails du formateur seront bientôt disponibles.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Avis des étudiants
                    </h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {course.rating ? course.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(course.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Basé sur {course.reviews_count || 0} avis
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = Math.floor(Math.random() * 10); // Placeholder - would come from API
                      const percentage = course.reviews_count ? (count / course.reviews_count) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-8">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Avis récents</h4>
                  
                  {/* Mock reviews - in real implementation, these would come from the API */}
                  {(course.reviews_count || 0) > 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {String.fromCharCode(65 + review - 1)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  Étudiant {review}
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className="w-4 h-4 text-yellow-400 fill-current"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              Il y a {review} jour{review > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-gray-700">
                            Excellent cours ! Le contenu est très bien structuré et les explications sont claires. 
                            Je recommande vivement cette formation.
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Aucun avis pour le moment. Soyez le premier à laisser un avis !
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
