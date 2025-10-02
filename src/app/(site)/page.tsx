import { getPageBySlug } from '@/lib/sanity'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import PopularCoursesSection from '@/components/sections/PopularCoursesSection'
import PromoBand from '@/components/sections/PromoBand'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'
import ListIconSection from '@/components/sections/ListIconSection'
import AnimatedRichTextSection from '@/components/sections/AnimatedRichTextSection'

// Revalidate every 10 seconds for fresh Sanity content
export const revalidate = 10

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
        <HeroSection 
          hero={{
            title: content.hero.title || '',
            subtitle: content.hero.subtitle || '',
            backgroundImage: content.hero.backgroundImage,
            cta_primary: content.hero.ctaPrimary,
          }} 
        />
      )}
      
      {/* Temporary content while CMS is being set up */}
      {!content && <PromoBand />}

      {/* Dynamic Sections from Sanity CMS */}
      {content?.sections?.map((section: any) => {
        // Feature Cards Section
        if (section._type === 'featureCards') {
          return (
            <FeatureCardsSection
              key={section._key}
              title={section.title}
              subtitle={section.subtitle}
              cards={section.cards || []}
              columns={section.columns}
            />
          )
        }
        
        // List Icon Section
        if (section._type === 'listSection') {
          return (
            <ListIconSection
              key={section._key}
              title={section.title}
              subtitle={section.subtitle}
              description={section.description}
              items={section.items || []}
              ctaText={section.ctaText}
              ctaLink={section.ctaLink}
            />
          )
        }
        
        // Rich Text Section
        if (section._type === 'richTextSection' && section.content) {
          return (
            <AnimatedRichTextSection key={section._key} section={section} />
          )
        }
        
        return null
      })}
      
      {/* Popular Courses Section - Always show */}
      <PopularCoursesSection
        title="Nos formations populaires"
        subtitle="Découvrez nos formations les plus demandées"
        limit={6}
      />
    </div>
  )
}
