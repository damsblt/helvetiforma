'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  article: any;
  userId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ article, userId, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: article._id,
            userId,
            amount: article.price || 0,
            type: 'article'
          })
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError(data.error || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError('Failed to create payment intent');
      }
    };

    if (article && userId) {
      createPaymentIntent();
    }
  }, [article, userId, onError]);

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
            Payer {article.price || 0} CHF
          </>
        )}
      </button>
    </form>
  );
}

export default function ArticleCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        console.log('🔍 Checkout - Loading article with ID:', articleId);
        
        // Use our API endpoint instead of direct WordPress call
        const response = await fetch(`/api/wordpress/posts/${articleId}`);
        const data = await response.json();
        
        console.log('🔍 Checkout - API response:', data);
        
        if (data && data.title) {
          setArticle(data);
        } else {
          setError('Article non trouvé');
        }
      } catch (error) {
        console.error('❌ Checkout - Error loading article:', error);
        setError('Échec du chargement de l\'article');
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Record the purchase
      const response = await fetch('/api/payment/record-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: article._id,
          userId: user?.id,
          amount: article.price,
          paymentIntentId: paymentIntent.id,
          type: 'article'
        })
      });

      if (response.ok) {
        setSuccess(true);
        // Redirect to article page after successful payment with success parameter
        setTimeout(() => {
          router.push(`/posts/${article.slug}?payment=success`);
        }, 2000);
      } else {
        setError('Erreur lors de l\'enregistrement de l\'achat');
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      setError('Erreur lors de l\'enregistrement de l\'achat');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/posts" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retour aux articles
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 mb-4">Paiement réussi!</h1>
          <p className="text-gray-600 mb-4">Votre achat a été enregistré avec succès.</p>
          <p className="text-sm text-gray-500">Redirection vers l'article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Article non trouvé</h1>
          <Link 
            href="/posts" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retour aux articles
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Connexion requise</h1>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour effectuer un achat.</p>
          <Link 
            href={`/login?callbackUrl=${encodeURIComponent(`/checkout/${articleId}`)}`}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/posts" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux articles
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser votre achat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Article Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Article sélectionné</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{article.title}</h3>
              <div 
                className="text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: article.excerpt }}
              />
              
              {/* Features */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Accès premium garanti
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  Accès immédiat après paiement
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  Contenu exclusif
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-500">Prix</span>
                <span className="text-2xl font-bold text-green-600">
                  {article.price || 0} CHF
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de paiement</h2>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                article={article}
                userId={user.id}
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
        </div>
      </div>
    </div>
  );
}