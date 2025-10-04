'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Lock, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import StripeElementsForm from '@/components/payment/StripeElementsForm'

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

export default function CheckoutPage({ post }: CheckoutPageProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const user = session?.user

  const handlePaymentSuccess = () => {
    // Rediriger vers l'article après paiement réussi
    window.location.href = `/posts/${post.slug.current}?payment=success`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
          <p className="text-gray-600 dark:text-gray-400">
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Article premium
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Prix</span>
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
              <StripeElementsForm
                postId={post._id}
                postTitle={post.title}
                price={post.price}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Connexion requise
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
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