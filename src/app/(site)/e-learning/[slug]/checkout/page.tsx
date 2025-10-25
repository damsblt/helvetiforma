'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  Shield,
  AlertCircle
} from 'lucide-react';
import { TutorCourse, getTutorCourse } from '@/lib/tutor-lms';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  course: TutorCourse;
  userId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ course, userId, onSuccess, onError }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  // Create payment intent when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const createPaymentIntent = async () => {
      if (!isMounted) return;
      
      try {
        console.log('🔄 Creating payment intent...');
        console.log('🔍 Payment intent data:', {
          courseId: course.id,
          userId,
          amount: course.course_price || 0,
          userType: typeof userId,
          coursePriceType: typeof course.course_price
        });
        
        const response = await fetch('/api/payment/course-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: course.id,
            userId,
            amount: course.course_price || 0
          })
        });

        if (!isMounted) return;

        const data = await response.json();
        console.log('🔍 Payment intent response:', data);
        
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError(data.error || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('❌ Payment intent error:', error);
        if (isMounted) {
          onError('Failed to initialize payment');
        }
      }
    };

    if (course && userId) {
      createPaymentIntent();
    }
    
    return () => {
      isMounted = false;
    };
  }, [course?.id, userId, onError]); // Only depend on course.id, not the whole course object

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        console.error('Stripe payment error:', error);
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        onError('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <Lock className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-sm text-yellow-800">
            Paiement sécurisé avec Stripe
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de carte
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !clientSecret || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Traitement...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Payer {formatPrice(course.course_price || 0)}
          </>
        )}
      </button>
    </form>
  );
}

export default function CourseCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;
  
  // Debug: Log user state
  console.log('🔍 CourseCheckoutPage - User state:', user);
  console.log('🔍 CourseCheckoutPage - Slug:', slug);
  
  const [course, setCourse] = useState<TutorCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = `/e-learning/${slug}/checkout`;
      router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, loading, slug, router]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getTutorCourse(slug);
        setCourse(courseData);
      } catch (error) {
        console.error('Error loading course:', error);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadCourse();
    }
  }, [slug]);

  // Handle payment success from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (payment === 'success' && sessionId && user && course) {
      console.log('🎉 Payment successful, processing enrollment...');
      processPaymentSuccess(sessionId);
    }
  }, [user, course]);

  const processPaymentSuccess = async (sessionId: string) => {
    try {
      console.log('🔄 Processing payment success...');
      
      const response = await fetch('/api/payment/process-course-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          courseId: course?.id,
          userId: user?.id
        })
      });

      const data = await response.json();
      console.log('🔍 Payment processing response:', data);
      
      if (data.success) {
        console.log('✅ Payment processed and user enrolled successfully');
        setSuccess(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push(`/dashboard?enrolled=true&course=${course?.slug}`);
        }, 3000);
      } else {
        console.error('❌ Payment processing failed:', data.error);
        setError(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      setError('Failed to process payment');
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log('🎉 Payment succeeded, enrolling user in course...');
      console.log('🔍 Payment intent:', paymentIntent);
      console.log('🔍 Course ID:', course?.id);
      console.log('🔍 User ID:', user?.id);
      console.log('🔍 Amount:', course?.course_price);
      
      // Enroll user in course
      const response = await fetch('/api/tutor-lms/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course?.id,
          userId: user?.id,
          amount: course?.course_price || 0,
          paymentMethod: 'stripe',
          paymentIntentId: paymentIntent.id
        })
      });

      const data = await response.json();
      console.log('🔍 Enrollment response:', data);
      
      if (data.success) {
        console.log('✅ Enrollment successful');
        setSuccess(true);
        // Redirect to course after 3 seconds
        setTimeout(() => {
          router.push(`/e-learning/${course?.slug}`);
        }, 3000);
      } else {
        console.error('❌ Enrollment failed:', data.error);
        setError(data.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      setError('Failed to complete enrollment');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
            <ArrowLeft className="w-4 h-4" />
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h1>
          
          <p className="text-gray-600 mb-6">
            🎉 Félicitations ! Vous êtes maintenant inscrit à la formation <strong>{course.title}</strong>. 
            Vous allez être redirigé vers la formation pour commencer votre apprentissage.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Inscription confirmée</p>
                <p>Vous pouvez maintenant accéder à tous les contenus de cette formation.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              href={`/e-learning/${course.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Accéder à la formation
            </Link>
            
            <div className="text-sm text-gray-500">
              Redirection automatique dans 3 secondes...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/e-learning/${course.slug}`}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finaliser l'achat</h1>
              <p className="text-gray-600">Complétez votre inscription à la formation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la formation</h2>
              
              <div className="space-y-4">
                {/* Course Image */}
                <div className="relative">
                  {course.featured_image ? (
                    <img
                      src={course.featured_image}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Lock className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.course_level || 'beginner')}`}>
                      {getLevelLabel(course.course_level || 'beginner')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {course.course_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.course_duration}</span>
                      </div>
                    )}
                    
                    {course.enrolled_count && course.enrolled_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolled_count} inscrits</span>
                      </div>
                    )}

                    {course.rating && course.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Benefits */}
            {course.course_benefits && course.course_benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

          {/* Payment Form */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'achat</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Formation</span>
                  <span className="font-medium">{course.title}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prix</span>
                  <span className="font-medium">{formatPrice(course.course_price || 0)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">{formatPrice(course.course_price || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Erreur de paiement</p>
                    <p className="mt-1">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {user && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Informations de paiement</h2>
                
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    course={course}
                    userId={user.id || '1'} // Fallback to test user ID
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>

                {/* Security badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      SSL sécurisé
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Stripe
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paiement sécurisé
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Connexion requise</p>
                    <p>Vous devez être connecté pour finaliser l'achat.</p>
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/e-learning/${slug}/checkout`)}`}
                      className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
