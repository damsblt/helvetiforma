import { Metadata } from 'next'
import { getWordPressPostBySlug } from '@/lib/wordpress'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowLeft, FileText } from 'lucide-react'

// Revalidate every hour
export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getWordPressPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Document non trouvé - HelvetiForma',
      description: 'Ce document n\'existe pas ou a été supprimé.',
    }
  }

  // Strip HTML tags from excerpt for meta description
  const cleanExcerpt = post.excerpt.replace(/<[^>]*>?/gm, '')

  return {
    title: `${post.title} - HelvetiForma`,
    description: cleanExcerpt || 'Découvrez nos guides et ressources sur la comptabilité et la gestion en Suisse.',
    openGraph: {
      title: post.title,
      description: cleanExcerpt,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

export default async function WordPressPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getWordPressPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Format date
  const formattedDate = new Date(post.created_at).toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/coins-des-docs#documents"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux documents
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-blue-100 mb-4">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Article</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="container mx-auto px-4 -mt-12 mb-12">
          <div className="max-w-4xl mx-auto">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-700 dark:prose-p:text-white prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-6 prose-ul:space-y-2
                prose-li:text-gray-700 dark:prose-li:text-white
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
              prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer CTA */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Besoin de plus d'informations ?
              </h3>
              <p className="text-gray-600 dark:text-white mb-6 max-w-2xl mx-auto">
                Nos experts sont là pour répondre à vos questions sur la comptabilité et la gestion RH en Suisse.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Nous contacter
                </Link>
                <Link
                  href="/coins-des-docs#documents"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 dark:border-blue-500 text-base font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Voir tous les documents
                </Link>
              </div>
            </div>
          </div>

          {/* Back to documents link */}
          <div className="mt-12 text-center">
            <Link
              href="/coins-des-docs#documents"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à tous les documents
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

