'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const callbackUrl = searchParams.get('callbackUrl')

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            {message && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}
            <LoginForm callbackUrl={callbackUrl || undefined} />
            
            {/* Liens utiles */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-3">
                <Link
                  href="/"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
