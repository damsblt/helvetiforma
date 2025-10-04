'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { checkUserPurchaseClient } from '@/lib/purchases-client'

interface DebugInfoProps {
  postId: string
}

export default function DebugInfo({ postId }: DebugInfoProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getDebugInfo() {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        const info: any = {
          hasSession: !!session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at
          } : null,
          timestamp: new Date().toISOString()
        }

        if (session?.user) {
          const hasPurchased = await checkUserPurchaseClient(session.user.id, postId)
          info.purchaseCheck = {
            postId,
            hasPurchased,
            userId: session.user.id
          }
        }

        setDebugInfo(info)
      } catch (error) {
        setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }

    getDebugInfo()
  }, [postId])

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded">Loading debug info...</div>
  }

  if (!debugInfo) {
    return <div className="p-4 bg-red-100 rounded">No debug info available</div>
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <h3 className="font-bold mb-2">🐛 Debug Information</h3>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
