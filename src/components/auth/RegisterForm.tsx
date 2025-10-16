'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { authenticateUser } from '@/lib/wordpress-auth-simple'
import { useAuth } from '@/contexts/AuthContext'

interface RegisterFormProps {
  onSuccess?: () => void
  callbackUrl?: string
}

export default function RegisterForm({ onSuccess, callbackUrl }: RegisterFormProps) {
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Debug: Log the callbackUrl
  console.log('🔍 RegisterForm - callbackUrl received:', callbackUrl)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    try {
      // First, create the user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      })

      console.log('🔍 RegisterForm - Registration API response status:', response.status)
      const result = await response.json()
      console.log('🔍 RegisterForm - Registration API response:', result)

      if (result.success) {
        console.log('✅ User created successfully, attempting autologin...')
        
        // User created successfully, now log them in using WordPress auth
        const loginResult = await authenticateUser(formData.email, formData.password)

        console.log('🔍 Autologin result:', loginResult)

        if (loginResult.success && loginResult.user) {
          console.log('✅ Autologin successful, updating AuthContext and redirecting to checkout...')
          console.log('🔍 User data:', loginResult.user)
          console.log('🔍 Callback URL:', callbackUrl)
          
          // Update the AuthContext with the logged-in user
          setUser(loginResult.user)
          
          // Store user in localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('helvetiforma_user', JSON.stringify(loginResult.user))
            console.log('✅ User stored in localStorage')
          }
          
          // Registration and login successful, redirect to checkout
          if (onSuccess) {
            console.log('🔍 Calling onSuccess callback')
            onSuccess()
          } else if (callbackUrl) {
            console.log('🔍 Redirecting to callback URL:', callbackUrl)
            // Use router.push for better navigation
            if (typeof window !== 'undefined') {
              // Force a page reload to ensure the user state is properly updated
              window.location.href = callbackUrl
            }
          } else {
            console.log('🔍 Setting success state')
            setSuccess(true)
          }
        } else {
          console.log('ℹ️ Autologin échoué, redirection vers login...')
          // Toujours rediriger vers login avec message de succès et callback
          if (callbackUrl) {
            // Rediriger vers login avec message de succès et callback
            window.location.href = `/login?message=Compte créé avec succès ! Veuillez vous connecter pour finaliser votre achat.&callbackUrl=${encodeURIComponent(callbackUrl)}`
          } else {
            setSuccess(true)
          }
        }
      } else {
        setError(result.error || 'Une erreur est survenue lors de l\'inscription')
      }
    } catch (error) {
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-4 sm:p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          🎉 Inscription réussie !
        </h3>
        <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 max-w-md mx-auto">
          Un email de confirmation a été envoyé à votre adresse email. 
          Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Se connecter maintenant</span>
            <span className="sm:hidden">Se connecter</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Retour à l'accueil</span>
            <span className="sm:hidden">Accueil</span>
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un compte
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-white">
          Accédez à nos articles premium et webinaires
        </p>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 sm:mb-2">
            Prénom
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Votre prénom"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 sm:mb-2">
            Nom
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Votre nom"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 sm:mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 sm:mb-2">
          Mot de passe *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          minLength={6}
          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Au moins 6 caractères"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 sm:mb-2">
          Confirmer le mot de passe *
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Répétez votre mot de passe"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden sm:inline">Création du compte...</span>
            <span className="sm:hidden">Création...</span>
          </>
        ) : (
          'Créer mon compte'
        )}
      </button>

      <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-white">
          Déjà un compte ?{' '}
          <Link
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </motion.form>
  )
}
