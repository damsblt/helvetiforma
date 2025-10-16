'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface OptimizedPaymentButtonProps {
  postId: string
  postTitle: string
  postSlug?: string
  price: number
  className?: string
  onSuccess?: () => void
}

export default function OptimizedPaymentButton({ 
  postId, 
  postTitle, 
  postSlug, 
  price, 
  className = '', 
  onSuccess 
}: OptimizedPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handlePayment = async () => {
    console.log('🔍 OptimizedPaymentButton - postId reçu:', postId, typeof postId)
    console.log('🔍 OptimizedPaymentButton - User state:', user)
    setIsLoading(true)

    try {
      if (!user) {
        console.log('🔍 OptimizedPaymentButton - No user, redirecting to login page')
        // Rediriger vers la page de login avec callback vers le checkout
        const checkoutUrl = `/checkout/${postId}`
        const loginUrl = `/login?message=Connectez-vous pour accéder à cet article premium&callbackUrl=${encodeURIComponent(checkoutUrl)}`
        console.log('🔍 OptimizedPaymentButton - Login URL:', loginUrl)
        router.push(loginUrl)
        return
      }

      console.log('🔍 OptimizedPaymentButton - User is logged in, proceeding with checkout')

      // Vérifier que postId est valide avant la redirection
      if (!postId || postId === 'undefined' || postId === 'null') {
        console.error('❌ OptimizedPaymentButton - postId invalide:', postId)
        return
      }

      // Rediriger directement vers la page de checkout
      // Utiliser le slug si disponible, sinon l'ID
      const checkoutId = postSlug || postId;
      console.log('🔍 OptimizedPaymentButton - Redirection vers:', `/checkout/${checkoutId}`)
      router.push(`/checkout/${checkoutId}`)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erreur:', error)
      console.error('Erreur de paiement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Traitement...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Acheter pour {price} CHF
        </>
      )}
    </button>
  )
}