'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import PaymentErrorBoundary from './PaymentErrorBoundary'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeElementsFormProps {
  postId: string
  postTitle: string
  price: number
  onSuccess?: () => void
}

function PaymentForm({ postId, postTitle, price, onSuccess }: StripeElementsFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()
  }, [supabase.auth])

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
      // Créer la session de paiement
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          user: {
            id: user.id,
            email: user.email
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement')
      }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      console.error('Erreur de paiement:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Informations de carte
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
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
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Paiement sécurisé
            </span>
          </div>
          <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {price} CHF
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Traitement...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Acheter l'article
          </>
        )}
      </button>
    </form>
  )
}

export default function StripeElementsForm(props: StripeElementsFormProps) {
  return (
    <PaymentErrorBoundary>
      <Elements stripe={stripePromise}>
        <PaymentForm {...props} />
      </Elements>
    </PaymentErrorBoundary>
  )
}