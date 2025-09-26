import { getPageContent } from '@/lib/content-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import PopularCoursesSection from '@/components/sections/PopularCoursesSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import StatsSection from '@/components/sections/StatsSection'
import CTASection from '@/components/sections/CTASection'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent('home')
  
  if (!content) {
    return {
      title: 'HelvetiForma - Formation Professionnelle en Suisse',
      description: 'Formations certifiées en comptabilité et gestion d\'entreprise pour professionnels suisses.',
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
}

export default async function HomePage() {
  const content = await getPageContent('home')
  
  if (!content) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {content.hero && (
        <HeroSection hero={content.hero} />
      )}
      
      {/* Dynamic Sections */}
      {content.sections?.map((section, index) => {
        switch (section.type) {
          case 'features':
            return (
              <FeaturesSection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                items={section.items}
              />
            )
          
          case 'popular_courses':
            return (
              <PopularCoursesSection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                limit={section.limit}
              />
            )
          
          case 'testimonials':
            return (
              <TestimonialsSection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                items={section.items}
              />
            )
          
          case 'stats':
            return (
              <StatsSection
                key={index}
                title={section.title}
                items={section.items}
              />
            )
          
          case 'cta':
            return (
              <CTASection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                cta_primary={section.cta_primary}
                cta_secondary={section.cta_secondary}
              />
            )
          
          default:
            return null
        }
      })}
      
      {/* Main Content */}
      {content.content && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </div>
        </section>
      )}
    </div>
  )
}
