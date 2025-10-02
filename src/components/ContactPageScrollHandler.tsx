'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ContactPageScrollHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we should scroll to contact form
    const shouldScrollToForm = searchParams.get('webinar') || 
                              searchParams.get('webinarId') || 
                              window.location.hash === '#contact-form'

    if (shouldScrollToForm) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        const contactFormElement = document.getElementById('contact-form')
        if (contactFormElement) {
          contactFormElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // This component doesn't render anything
  return null
}
