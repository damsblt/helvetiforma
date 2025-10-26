import { getPageBySlug } from '@/lib/sanity'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'
import AnimatedRichTextSection from '@/components/sections/AnimatedRichTextSection'
import AnimatedWebinarsHeader from '@/components/sections/AnimatedWebinarsHeader'
import SessionsClient from './SessionsClient'

// Revalidate every 10 seconds to ensure content updates are reflected
export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  try {
    const content = await getPageBySlug('sessions')
    
    if (!content) {
      return {
        title: 'Sessions - HelvetiForma',
        description: 'Participez à nos webinaires en direct via Microsoft Teams.',
      }
    }

    return {
      title: content.seo?.title || content.title,
      description: content.seo?.description || content.description,
      keywords: content.seo?.keywords,
      openGraph: {
        title: content.seo?.title || content.title,
        description: content.seo?.description || content.description,
        type: 'website',
      },
    }
  } catch (error) {
    console.error('Error generating metadata for sessions page:', error)
    return {
      title: 'Sessions - HelvetiForma',
      description: 'Participez à nos webinaires en direct via Microsoft Teams.',
    }
  }
}

export default async function CalendrierPage() {
  let content = null
  
  try {
    content = await getPageBySlug('sessions')
  } catch (error) {
    console.error('Error fetching sessions page content:', error)
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page non trouvée</h1>
          <p className="text-gray-600 dark:text-white mb-6">Le contenu de cette page n'a pas encore été créé dans Sanity CMS.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {content?.hero && (
        <HeroSection 
          hero={{
            title: content.hero.title || 'Webinaires',
            subtitle: content.hero.subtitle || 'Participez à nos sessions interactives en direct',
            backgroundImage: content.hero.backgroundImage,
            cta_primary: content.hero.ctaPrimary,
          }} 
        />
      )}

      {/* Dynamic Sections from Sanity CMS */}
      {content?.sections?.map((section, index) => {
        // Rich Text Section
        if (section._type === 'richTextSection' && section.content) {
          return (
            <AnimatedRichTextSection key={section._key} section={section} />
          )
        }
        
        // Feature Cards Section
        if (section._type === 'featureCards' && section.cards) {
          return (
            <div key={section._key} className="mb-8">
              <FeatureCardsSection
                title={section.title || ''}
                subtitle={section.subtitle}
                cards={section.cards}
                columns={section.columns || 3}
              />
            </div>
          )
        }
        
        return null
      })}

      {/* Webinars List - Client Component */}
      <section id="webinaires" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedWebinarsHeader />
          <Suspense fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-white">Chargement des webinaires...</p>
            </div>
          }>
            <SessionsClient />
          </Suspense>
        </div>
      </section>
    </div>
  )
}