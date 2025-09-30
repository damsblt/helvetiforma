import { getPageBySlug } from '@/lib/sanity'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import PopularCoursesSection from '@/components/sections/PopularCoursesSection'
import PromoBand from '@/components/sections/PromoBand'
import PortableText from '@/components/ui/PortableText'

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
      {content?.sections?.map((section) => {
        // Generic content section with Portable Text
        if (section.content) {
          return (
            <section key={section._key} className="py-16 bg-white">
              <div className="container mx-auto px-4">
                {section.title && (
                  <h2 className="text-3xl font-bold text-center mb-4">{section.title}</h2>
                )}
                {section.subtitle && (
                  <p className="text-xl text-center text-gray-600 mb-8">{section.subtitle}</p>
                )}
                
                {/* Render content in columns if specified */}
                {section.columns && section.columns > 1 ? (
                  <div className={`grid grid-cols-1 md:grid-cols-${section.columns} gap-8 max-w-6xl mx-auto`}>
                    <div className="prose prose-lg max-w-none">
                      <PortableText content={section.content} />
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-4xl mx-auto">
                    <PortableText content={section.content} />
                  </div>
                )}
              </div>
            </section>
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
