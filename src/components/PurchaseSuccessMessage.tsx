'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PurchaseSuccessMessage() {
  const searchParams = useSearchParams()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const alreadyPurchased = searchParams.get('alreadyPurchased')
    const paymentSuccess = searchParams.get('payment')
    
    if (alreadyPurchased === 'true' || paymentSuccess === 'success') {
      setShowMessage(true)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!showMessage) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
              {searchParams.get('alreadyPurchased') === 'true' 
                ? 'Accès confirmé !' 
                : 'Paiement réussi !'
              }
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {searchParams.get('alreadyPurchased') === 'true'
                ? 'Vous avez déjà accès à cet article premium.'
                : 'Votre achat a été traité avec succès.'
              }
            </p>
          </div>
          <button
            onClick={() => setShowMessage(false)}
            className="flex-shrink-0 text-green-400 hover:text-green-600 dark:hover:text-green-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
