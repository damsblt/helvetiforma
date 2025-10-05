'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface DebugInfoProps {
  postId: string
}

export default function DebugInfo({ postId }: DebugInfoProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { data: session, status } = useSession()

  useEffect(() => {
    async function getDebugInfo() {
      try {
        const info: any = {
          hasSession: !!session,
          user: session?.user ? {
            id: (session.user as any)?.id,
            email: session.user.email,
            name: session.user.name
          } : null,
          timestamp: new Date().toISOString(),
          status
        }

        if (session?.user) {
          // Use server-side API to check purchase
          const userId = (session.user as any)?.id
          const response = await fetch(`/api/check-purchase?postId=${postId}`)
          const purchaseData = await response.json()
          
          info.purchaseCheck = {
            postId,
            hasPurchased: purchaseData.hasPurchased,
            userId: userId,
            apiResponse: purchaseData
          }
        }

        setDebugInfo(info)
      } catch (error) {
        setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      getDebugInfo()
    }
  }, [session, status, postId])

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
