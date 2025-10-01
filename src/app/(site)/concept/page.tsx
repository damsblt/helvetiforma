import { getPageBySlug } from '@/lib/sanity'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'
import ListIconSection from '@/components/sections/ListIconSection'
import PortableText from '@/components/ui/PortableText'
import Link from 'next/link'

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

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
          <p className="text-gray-600 mb-6">Le contenu de cette page n'a pas encore été créé dans Sanity CMS.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
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
            title: content.hero.title || '',
            subtitle: content.hero.subtitle || '',
            backgroundImage: content.hero.backgroundImage,
            cta_primary: content.hero.ctaPrimary,
          }} 
        />
      )}

      {/* Dynamic Sections from Sanity CMS */}
      {content?.sections?.map((section, index) => {
        // Feature Cards Section
        if (section._type === 'featureCards' && section.cards) {
          return (
            <div key={section._key} className="mb-16">
              <FeatureCardsSection
                title={section.title || ''}
                subtitle={section.subtitle}
                cards={section.cards}
                columns={section.columns || 3}
              />
            </div>
          )
        }

        // List Section with Icons
        if (section._type === 'listSection' && section.items) {
          return (
            <div key={section._key} className="mb-16">
              <ListIconSection
                title={section.title || ''}
                subtitle={section.subtitle}
                description={section.description}
                items={section.items}
                ctaText={section.ctaText}
                ctaLink={section.ctaLink}
              />
            </div>
          )
        }

        // Rich Text Section
        if (section._type === 'richTextSection' && section.content) {
          const bgColor = section.backgroundColor === 'gray' ? 'bg-gray-50' :
                         section.backgroundColor === 'lightblue' ? 'bg-blue-50' : 'bg-white'
          
          return (
            <section key={section._key} className={`${bgColor} py-16 mb-16`}>
              <div className="container mx-auto px-4 max-w-6xl">
                {section.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{section.title}</h2>
                )}
                {section.subtitle && (
                  <p className="text-xl text-center text-gray-600 mb-8">{section.subtitle}</p>
                )}
                <div className="prose prose-lg max-w-4xl mx-auto">
                  <PortableText content={section.content} />
                </div>
              </div>
            </section>
          )
        }
        
        return null
      })}

      {/* Default CTA if no sections available */}
      {(!content?.sections || content.sections.length === 0) && (
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Prêt à commencer votre formation ?</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Découvrez nos formations spécialisées et commencez votre parcours d'apprentissage dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-lg inline-block"
              >
                Consulter les formations
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors text-lg inline-block"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
