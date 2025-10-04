import { sanityClient } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import StripeElementsForm from '@/components/payment/StripeElementsForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PaymentPageProps {
  params: Promise<{ postId: string }>
}

async function getPost(postId: string) {
  const post = await sanityClient.fetch(
    `*[_type == "post" && _id == $postId][0]{
      _id,
      title,
      price,
      accessLevel,
      slug,
      excerpt,
      mainImage
    }`,
    { postId }
  )
  return post
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { postId } = await params
  const post = await getPost(postId)

  if (!post || post.accessLevel !== 'premium') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/posts/${post.slug.current}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'article
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Paiement sécurisé
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Finalisez votre achat pour accéder à l'article premium
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Article Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Résumé de votre achat
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {post.excerpt}
                  </p>
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Prix
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {post.price} CHF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Informations de paiement
            </h2>
            
            <StripeElementsForm
              postId={post._id}
              postTitle={post.title}
              price={post.price}
              onSuccess={() => {
                // Redirection sera gérée par Stripe
              }}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Paiement sécurisé
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Votre paiement est traité de manière sécurisée par Stripe. 
                Aucune information de carte bancaire n'est stockée sur nos serveurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
