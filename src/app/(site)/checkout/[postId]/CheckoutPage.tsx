'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Lock, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface Post {
  _id: string
  title: string
  price: number
  accessLevel: string
  slug: { current: string }
  previewContent?: any
  content?: any
  mainImage?: any
}

interface CheckoutPageProps {
  post: Post
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ postId, postTitle, price, postSlug, onSuccess }: { postId: string, postTitle: string, price: number, postSlug: string, onSuccess?: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe n\'est pas encore chargé')
      return
    }

    if (!user) {
      setError('Vous devez être connecté pour effectuer un achat')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Créer un PaymentIntent directement
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          user: {
            id: (user as any).id,
            email: user.email
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du paiement')
      }

      const { clientSecret } = await response.json()

      // Confirmer le paiement
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      })

      if (stripeError) {
        setError(stripeError.message || 'Une erreur est survenue lors du paiement')
      } else if (paymentIntent.status === 'succeeded') {
        // Paiement réussi
        onSuccess?.()
        window.location.href = `/posts/${postSlug}?payment=success`
      }
    } catch (err: any) {
      console.error('Erreur de paiement:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Informations de carte
          </label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Traitement...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Acheter pour {price} CHF
          </div>
        )}
      </button>
    </form>
  )
}

export default function CheckoutPage({ post }: CheckoutPageProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const user = session?.user
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true)
  const [hasAlreadyPurchased, setHasAlreadyPurchased] = useState(false)


  // Check if user has already purchased this article
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (status === 'loading') return
      
      if (!user) {
        setIsCheckingPurchase(false)
        return
      }

      try {
        const response = await fetch(`/api/check-purchase?postId=${post._id}`)
        const data = await response.json()
        
        
        if (data.hasPurchased) {
          setHasAlreadyPurchased(true)
          // Redirect to the article without payment overlay
          window.location.href = `/posts/${post.slug.current}?alreadyPurchased=true`
        }
      } catch (error) {
        console.error('Error checking purchase status:', error)
      } finally {
        setIsCheckingPurchase(false)
      }
    }

    checkPurchaseStatus()
  }, [status, user, post._id, post.slug.current])

  const handlePaymentSuccess = () => {
    // Rediriger vers l'article après paiement réussi
    window.location.href = `/posts/${post.slug.current}?payment=success`
  }

  if (isLoading || isCheckingPurchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white">
            {isLoading ? 'Chargement...' : 'Vérification de votre achat...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/posts/${post.slug.current}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'article
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Paiement sécurisé
          </h1>
          <p className="text-gray-600 dark:text-white">
            Finalisez votre achat pour accéder à l'article premium
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Résumé de l'achat */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Résumé de votre achat
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-white mt-1">
                  Article premium
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Prix</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {post.price} CHF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Informations de paiement
            </h2>
            

            {user ? (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  postId={post._id}
                  postTitle={post.title}
                  price={post.price}
                  postSlug={post.slug.current}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 dark:text-white mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Connexion requise
                </h3>
                <p className="text-gray-600 dark:text-white mb-6">
                  Vous devez être connecté pour effectuer un achat
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/checkout/${post._id}`)}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Paiement sécurisé
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Votre paiement est traité de manière sécurisée par Stripe. 
                Aucune information de carte bancaire n'est stockée sur nos serveurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
