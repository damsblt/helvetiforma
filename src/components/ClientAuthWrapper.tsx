'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import PaymentButton from './PaymentButton'

interface ClientAuthWrapperProps {
  postId: string
  postTitle: string
  price: number
  accessLevel: string
  isPremium: boolean
  children: React.ReactNode
}

export default function ClientAuthWrapper({ 
  postId, 
  postTitle, 
  price, 
  accessLevel, 
  isPremium, 
  children 
}: ClientAuthWrapperProps) {
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Afficher le contenu avec la logique d'authentification côté client
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const hasAccess = 
    accessLevel === 'public' || 
    (accessLevel === 'members' && user) ||
    (accessLevel === 'premium' && user) // Pour l'instant, on considère que si l'utilisateur est connecté, il peut acheter

  return (
    <>
      {children}
      
      {/* Section de paiement pour les utilisateurs connectés */}
      {isPremium && user && !hasAccess && (
        <div className="mt-16 p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700/50 shadow-lg">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Contenu Premium
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
              Pour accéder à l'intégralité de cet article premium ({price} CHF), effectuez votre achat ci-dessous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PaymentButton
                postId={postId}
                postTitle={postTitle}
                price={price}
                className="mb-4"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}