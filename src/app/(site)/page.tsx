import { getPageBySlug } from '@/lib/payload'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import PopularCoursesSection from '@/components/sections/PopularCoursesSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import StatsSection from '@/components/sections/StatsSection'
import CTASection from '@/components/sections/CTASection'
import ColumnsSection from '@/components/sections/ColumnsSection'
import PromoBand from '@/components/sections/PromoBand'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageBySlug('home')
  
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
  const content = await getPageBySlug('home')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {content?.hero && (
        <HeroSection hero={content.hero} />
      )}
      
      {/* Temporary content while CMS is being set up */}
      {!content && <PromoBand />}

      {/* Dynamic Sections from CMS */}
      {content?.sections?.map((section, index) => {
        switch (section.type) {
          case 'features':
            return (
              <FeaturesSection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                items={section.items}
                markdownHtml={section.markdownHtml}
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
                markdownHtml={section.markdownHtml}
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
                markdownHtml={section.markdownHtml}
              />
            )
          case 'columns':
            return (
              <ColumnsSection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                columns={section.columns}
                columnsContent={section.columnsContent}
              />
            )
          
          default:
            return null
        }
      })}
      
      {/* Main Content removed: sections are fully driven by frontmatter */}
    </div>
  )
}
