import { getPageBySlug } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import ContactInfoSection from '@/components/sections/ContactInfoSection'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'
import TeamSection from '@/components/sections/TeamSection'
import FAQSection from '@/components/sections/FAQSection'
import AnimatedRichTextSection from '@/components/sections/AnimatedRichTextSection'
import AnimatedContactForm from '@/components/sections/AnimatedContactForm'

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
      
      {/* Contact Information Section */}
      {pageContent.sections?.find(section => section._type === 'contactInfoSection') && (
        <section id="contact-info" className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            {(() => {
              const contactSection = pageContent.sections.find(section => section._type === 'contactInfoSection')
              return contactSection && contactSection.contactItems ? (
                <ContactInfoSection
                  title={contactSection.title}
                  subtitle={contactSection.subtitle}
                  contactItems={contactSection.contactItems}
                />
              ) : null
            })()}
          </div>
        </section>
      )}

      {/* Contact Form Section - Centered Full Width */}
      <section id="contact-form" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedContactForm />
        </div>
      </section>
      
      {/* Dynamic Sections from Sanity CMS */}
      {pageContent.sections?.filter(section => section._type !== 'contactInfoSection').map((section, index) => {
        // Rich Text Section
        if (section._type === 'richTextSection' && section.content) {
          // Add ID to first section for scrolling
          const sectionId = index === 0 ? 'contact-info' : undefined
          
          return (
            <div key={section._key} id={sectionId}>
              <AnimatedRichTextSection section={section} />
            </div>
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
    </div>
  )
}
