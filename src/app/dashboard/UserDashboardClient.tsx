'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import UserContentDashboard from '@/components/dashboard/UserContentDashboard'

export default function UserDashboardClient() {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chargement...
            </h1>
            <p className="text-gray-600 dark:text-white">
              Vérification de votre authentification.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    // Redirect to login with callback URL
    if (typeof window !== 'undefined') {
      window.location.href = '/login?callbackUrl=/dashboard'
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Redirection en cours...
            </h1>
            <p className="text-gray-600 dark:text-white">
              Vous allez être redirigé vers la page de connexion.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tableau de bord
          </h1>
          <p className="text-lg text-gray-600 dark:text-white">
            Bonjour {user?.name || user?.email}, voici un aperçu de vos achats et cours.
          </p>
        </motion.div>

        {/* Contenu principal */}
        <UserContentDashboard userId={user.id} />
      </div>
    </div>
  )
}
