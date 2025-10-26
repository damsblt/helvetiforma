'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import WordPressLoginForm from '@/components/auth/WordPressLoginForm'

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const callbackUrl = searchParams.get('callbackUrl')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8">
          {message && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p className="text-xs sm:text-sm font-medium">{message}</p>
            </div>
          )}
          <WordPressLoginForm />
          
          {/* Liens utiles */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-2 sm:space-y-3">
              <Link
                href="/"
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                ← Retour à l'accueil
              </Link>
              <div className="text-xs text-gray-500 dark:text-white">
                Besoin d'aide ?{' '}
                <Link
                  href="/contact"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contactez-nous
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
