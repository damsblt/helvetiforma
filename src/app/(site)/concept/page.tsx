import { getPageBySlug } from '@/lib/payload'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import StatsSection from '@/components/sections/StatsSection'
import CTASection from '@/components/sections/CTASection'
import ColumnsSection from '@/components/sections/ColumnsSection'
import PromoBand from '@/components/sections/PromoBand'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageBySlug('concept')
  
  if (!content) {
    return {
      title: 'Notre Concept - HelvetiForma',
      description: 'Découvrez notre approche unique de la formation professionnelle en Suisse.',
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

export default async function ConceptPage() {
  const content = await getPageBySlug('concept')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {content?.hero && (
        <HeroSection hero={content.hero} />
      )}
      
      {/* Temporary content while CMS is being set up */}
      {!content && <PromoBand title="Notre concept en action" subtitle="Section temporaire affichée entre le header et le footer." />}

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
