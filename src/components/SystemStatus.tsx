'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SystemStatus() {
  const [status, setStatus] = useState({
    supabase: 'checking',
    stripe: 'checking',
    sanity: 'checking'
  })

  useEffect(() => {
    // Test Supabase
    const testSupabase = async () => {
      try {
        // Vérifier si on est en mode démo
        if (supabaseUrl.includes('placeholder')) {
          setStatus(prev => ({ ...prev, supabase: 'demo' }))
          return
        }
        
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) throw error
        setStatus(prev => ({ ...prev, supabase: 'connected' }))
      } catch (error) {
        console.error('Supabase error:', error)
        setStatus(prev => ({ ...prev, supabase: 'error' }))
      }
    }

    // Test Stripe (vérification des variables d'environnement)
    const testStripe = () => {
      const hasStripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
                          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_stripe_publishable_key'
      setStatus(prev => ({ ...prev, stripe: hasStripeKey ? 'configured' : 'not-configured' }))
    }

    // Test Sanity (vérification des variables d'environnement)
    const testSanity = () => {
      const hasSanityConfig = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
                             process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your-sanity-project-id'
      setStatus(prev => ({ ...prev, sanity: hasSanityConfig ? 'configured' : 'not-configured' }))
    }

    testSupabase()
    testStripe()
    testSanity()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured':
        return 'text-green-600 bg-green-100'
      case 'checking':
        return 'text-yellow-600 bg-yellow-100'
      case 'demo':
        return 'text-blue-600 bg-blue-100'
      case 'error':
      case 'not-configured':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured':
        return '✅'
      case 'checking':
        return '⏳'
      case 'demo':
        return '🎭'
      case 'error':
      case 'not-configured':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Statut du Système
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Supabase</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.supabase)}`}>
            {getStatusIcon(status.supabase)} {status.supabase}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Stripe</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.stripe)}`}>
            {getStatusIcon(status.stripe)} {status.stripe}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Sanity</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.sanity)}`}>
            {getStatusIcon(status.sanity)} {status.sanity}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {status.supabase === 'demo'
            ? 'Mode démo actif 🎭'
            : status.supabase === 'connected' && status.stripe === 'configured' && status.sanity === 'configured'
            ? 'Système prêt ✅'
            : 'Configuration requise ⚠️'
          }
        </p>
      </div>
    </div>
  )
}
