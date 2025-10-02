'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface DevWrapperProps {
  children: React.ReactNode
}

export default function DevWrapper({ children }: DevWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for dev authentication in both development and production
    const devAuth = sessionStorage.getItem('dev-auth')
    
    if (devAuth === 'true') {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      router.push('/construction')
    }
  }, [router])

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Only render children if authenticated
  if (isAuthenticated) {
    return <>{children}</>
  }

  // This shouldn't be reached as we redirect to construction page
  return null
}
