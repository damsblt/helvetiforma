'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase'
import { checkUserPurchase } from '@/lib/purchases'
import LoginForm from '@/components/auth/LoginForm'
import PaymentButton from '@/components/PaymentButton'
import Link from 'next/link'
import { PortableText } from 'next-sanity'
import { portableTextComponents } from '@/components/ui/PortableTextComponents'

interface CheckoutPageProps {
  post: {
    _id: string
    title: string
    price: number
    slug: { current: string }
    previewContent: any
    content: any
    mainImage?: any
  }
}

export default function CheckoutPage({ post }: CheckoutPageProps) {
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      
      if (session?.user) {
        // Vérifier si l'utilisateur a déjà acheté cet article
        const purchased = await checkUserPurchase(session.user.id, post._id)
        setHasPurchased(purchased)
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          const purchased = await checkUserPurchase(session.user.id, post._id)
          setHasPurchased(purchased)
        } else {
          setHasPurchased(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [post._id])

  const handlePaymentSuccess = () => {
    setHasPurchased(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si l'utilisateur a déjà acheté, rediriger vers l'article
  if (hasPurchased) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Achat confirmé !
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Vous avez déjà acheté cet article. Vous pouvez maintenant y accéder.
          </p>
          <Link
            href={`/posts/${post.slug.current}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir l'article
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Acheter l'article
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {post.title}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Section de connexion */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {user ? 'Connecté' : 'Connexion'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {user 
                    ? `Bonjour ${user.email}` 
                    : 'Connectez-vous pour procéder au paiement'
                  }
                </p>
              </div>

              {!user && (
                <LoginForm onSuccess={() => {
                  // La session sera mise à jour automatiquement via onAuthStateChange
                }} />
              )}

              {user && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Vous êtes connecté !
                  </p>
                </div>
              )}
            </motion.div>

            {/* Section de paiement */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Paiement
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Achetez l'article pour {post.price} CHF
                </p>
              </div>

              {/* Aperçu de l'article */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Aperçu de l'article
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 max-h-32 overflow-y-auto">
                  <PortableText 
                    value={post.previewContent || post.content} 
                    components={portableTextComponents}
                  />
                </div>
              </div>

              {/* Bouton de paiement */}
              {user ? (
                <div className="space-y-4">
                  <PaymentButton
                    postId={post._id}
                    postTitle={post.title}
                    price={post.price}
                    className="w-full"
                    onSuccess={handlePaymentSuccess}
                  />
                  
                  <div className="text-center">
                    <Link
                      href={`/posts/${post.slug.current}`}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ← Retour à l'article
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Connectez-vous d'abord pour procéder au paiement
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
