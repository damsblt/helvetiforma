import { getPageBySlug } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import ContactForm from '@/components/forms/ContactForm'
import ContactInfo from '@/components/sections/ContactInfo'
import TeamSection from '@/components/sections/TeamSection'
import FAQSection from '@/components/sections/FAQSection'
import PortableText from '@/components/ui/PortableText'

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
      {pageContent.hero && (
        <HeroSection 
          hero={{
            title: pageContent.hero.title || '',
            subtitle: pageContent.hero.subtitle || '',
            backgroundImage: pageContent.hero.backgroundImage,
            cta_primary: pageContent.hero.ctaPrimary,
          }} 
        />
      )}
      
      {/* Contact Form Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Envoyez-nous un message
              </h2>
              <p className="text-muted-foreground mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>
              <ContactForm />
            </div>
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Informations de contact
              </h2>
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
      
      {/* Dynamic Sections from Sanity CMS */}
      {pageContent.sections?.map((section, index) => {
        // Rich Text Section
        if (section._type === 'richTextSection' && section.content) {
          const bgColor = section.backgroundColor === 'gray' ? 'bg-gray-50' :
                         section.backgroundColor === 'lightblue' ? 'bg-blue-50' : 'bg-white'
          
          return (
            <section key={section._key} className={`${bgColor} py-16`}>
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
    </div>
  )
}
