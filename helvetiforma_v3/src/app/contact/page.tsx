import { getPageContent } from '@/lib/content-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import ContactForm from '@/components/forms/ContactForm'
import ContactInfo from '@/components/sections/ContactInfo'
import TeamSection from '@/components/sections/TeamSection'
import FAQSection from '@/components/sections/FAQSection'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent('contact')
  
  if (!content) {
    return {
      title: 'Contact - HelvetiForma',
      description: 'Contactez notre équipe d\'experts pour vos questions sur la formation professionnelle.',
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

export default async function ContactPage() {
  const content = await getPageContent('contact')
  
  if (!content) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {content.hero && (
        <HeroSection hero={content.hero} />
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
      
      {/* Dynamic Sections */}
      {content.sections?.map((section, index) => {
        switch (section.type) {
          case 'team':
            return (
              <TeamSection
                key={index}
                title={section.title}
                subtitle={section.subtitle}
                items={section.items}
              />
            )
          
          case 'faq':
            return (
              <FAQSection
                key={index}
                title={section.title}
                items={section.items}
              />
            )
          
          default:
            return null
        }
      })}
      
      {/* Main Content */}
      {content.content && (
        <section className="py-16 px-4 bg-secondary/30">
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
