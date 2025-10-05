import { Metadata } from 'next'
import { getPageBySlug, sanityClient, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import { Calendar, FileText, Lock, Sparkles } from 'lucide-react'
import HeroSection from '@/components/sections/HeroSection'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'
import AnimatedRichTextSection from '@/components/sections/AnimatedRichTextSection'
import { type SanityDocument } from 'next-sanity'

// Revalidate every 10 seconds for fresh Sanity content
export const revalidate = 10

// Query to fetch all published articles with necessary fields
const ARTICLES_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc){
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  image,
  category,
  tags,
  accessLevel,
  price,
  "categoryTitle": category
}`

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageBySlug('coins-des-docs')
  
  if (!content) {
    return {
      title: 'Coin des docs - HelvetiForma',
      description: 'Découvrez notre bibliothèque d\'articles, guides et ressources sur la comptabilité, la gestion des salaires et les charges sociales en Suisse.',
    }
  }

  return {
    title: content.seo?.title || content.title + ' - HelvetiForma',
    description: content.seo?.description || content.description,
    keywords: content.seo?.keywords,
  }
}

interface SanityArticle extends SanityDocument {
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  image?: any
  category?: string
  categoryTitle?: string
  tags?: string[]
  accessLevel?: 'public' | 'members' | 'premium'
  price?: number
}

export default async function CoinsDesDocsPage() {
  const content = await getPageBySlug('coins-des-docs')
  const articles = (await sanityClient.fetch(
    ARTICLES_QUERY,
    {},
    { next: { revalidate: 10 } }
  )) as SanityArticle[]

  // If no Sanity page content exists, show fallback
  if (!content) {
    return <FallbackCoinsDesDocsPage articles={articles} />
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section from Sanity */}
      {content?.hero && (
        <HeroSection 
          hero={{
            title: content.hero.title || 'Articles & Ressources',
            subtitle: content.hero.subtitle || 'Explorez notre bibliothèque d\'articles et guides pratiques',
            backgroundImage: content.hero.backgroundImage,
            cta_primary: content.hero.ctaPrimary,
          }} 
        />
      )}

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
        
        // Rich Text Section
        if (section._type === 'richTextSection' && section.content) {
          return (
            <AnimatedRichTextSection key={section._key} section={section} />
          )
        }
        
        return null
      })}

      {/* Articles Section - Always show */}
      <section id="articles" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Articles disponibles
              </h2>
              <p className="text-lg text-gray-600 dark:text-white max-w-2xl mx-auto">
                Nos guides et ressources créés par nos experts et mis à jour selon les dernières réglementations suisses.
              </p>
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-white mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun article disponible
                </h3>
                <p className="text-gray-600 dark:text-white">
                  Nous ajoutons régulièrement de nouveaux guides et ressources.
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Besoin d'aide personnalisée ?
                </h3>
                <p className="text-gray-600 dark:text-white mb-6">
                  Nos experts sont là pour vous accompagner dans vos projets comptables et RH.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Nous contacter
                  </Link>
                  <Link
                    href="/sessions#webinaires"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 dark:border-blue-500 text-base font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Voir nos sessions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Fallback component when no Sanity page content exists
function FallbackCoinsDesDocsPage({ articles }: { articles: SanityArticle[] }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Coin des docs
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Explorez notre bibliothèque d'articles et guides pratiques sur la comptabilité, 
              la gestion des salaires et les charges sociales en Suisse.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-blue-200">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mis à jour régulièrement
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {articles.length} articles
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="articles" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nos articles et guides
              </h2>
              <p className="text-lg text-gray-600 dark:text-white max-w-2xl mx-auto">
                Accédez à nos articles, guides et ressources pour maîtriser 
                la comptabilité et la gestion RH en Suisse.
              </p>
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-white mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun article disponible
                </h3>
                <p className="text-gray-600 dark:text-white">
                  Nous ajoutons régulièrement de nouveaux guides et ressources.
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Besoin d'aide personnalisée ?
                </h3>
                <p className="text-gray-600 dark:text-white mb-6">
                  Nos experts sont là pour vous accompagner dans vos projets comptables et RH.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Nous contacter
                  </Link>
                  <Link
                    href="/sessions#webinaires"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 dark:border-blue-500 text-base font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Voir nos sessions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface ArticleCardProps {
  article: SanityArticle
}

function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl = article.image ? urlFor(article.image)?.width(400).height(250).url() : null
  const accessLevel = article.accessLevel || 'public'
  
  // Access level badge configuration
  const getAccessBadge = () => {
    if (accessLevel === 'premium') {
      return {
        icon: <Sparkles className="w-3.5 h-3.5" />,
        label: 'Premium',
        className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      }
    }
    if (accessLevel === 'members') {
      return {
        icon: <Lock className="w-3.5 h-3.5" />,
        label: 'Membres',
        className: 'bg-blue-600 text-white',
      }
    }
    return null
  }

  const badge = getAccessBadge()
  
  return (
    <Link 
      href={`/posts/${article.slug.current}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Access Badge Overlay */}
          {badge && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                {badge.icon}
                {badge.label}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {/* Category */}
        {article.categoryTitle && (
          <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded mb-3">
            {article.categoryTitle}
          </span>
        )}
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>
        
        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-gray-600 dark:text-white mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs text-gray-500 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-white flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Lire l'article
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        
        {/* Price for premium articles */}
        {accessLevel === 'premium' && article.price && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-white">Prix</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {article.price} CHF
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

