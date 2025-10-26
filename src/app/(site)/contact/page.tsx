import { getPageBySlug } from '@/lib/sanity'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import AnimatedContactForm from '@/components/sections/AnimatedContactForm'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'

// Revalidate every 10 seconds for fresh Sanity content
export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageBySlug('contact')
  
  // Use default metadata if no content from Sanity
  const defaultMetadata = {
    title: 'Contact - HelvetiForma',
    description: 'Contactez notre équipe d\'experts pour vos questions sur la formation professionnelle.',
    keywords: 'contact, formation, conseil, accompagnement, HelvetiForma',
    openGraph: {
      title: 'Contact - HelvetiForma',
      description: 'Contactez notre équipe d\'experts pour vos questions sur la formation professionnelle.',
      type: 'website' as const,
    },
  }
  
  if (!content) {
    return defaultMetadata
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

export default async function ContactPage() {
  const content = await getPageBySlug('contact')
  
  // If no content from Sanity, use default content
  const defaultContent = {
    title: 'Contact',
    description: 'Contactez notre équipe d\'experts pour vos questions sur la formation professionnelle.',
    hero: {
      title: 'Contactez-nous',
      subtitle: 'Notre équipe d\'experts est là pour vous accompagner dans votre parcours de formation professionnelle.',
      backgroundImage: null,
      ctaPrimary: {
        text: 'Découvrir nos formations',
        link: '/concept'
      }
    },
    sections: []
  }
  
  const pageContent = content || defaultContent

  // Find the "Pourquoi nous contacter ?" section (featureCards)
  const whyContactSection = pageContent.sections?.find(
    section => section._type === 'featureCards' && section.title === 'Pourquoi nous contacter ?'
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        hero={{
          title: pageContent.hero?.title || 'Contactez-nous',
          subtitle: pageContent.hero?.subtitle || 'Notre équipe d\'experts est là pour vous accompagner',
          backgroundImage: pageContent.hero?.backgroundImage || '/images/contact-hero.jpg',
          cta_primary: pageContent.hero?.ctaPrimary,
        }} 
      />

      {/* Why Contact Section */}
      {whyContactSection && (
        <FeatureCardsSection
          title={whyContactSection.title}
          subtitle={whyContactSection.subtitle}
          cards={whyContactSection.cards}
          columns={whyContactSection.columns || 2}
        />
      )}

      {/* Contact Form Section - Centered Full Width */}
      <section id="contact-form" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedContactForm />
        </div>
      </section>
    </div>
  )
}
