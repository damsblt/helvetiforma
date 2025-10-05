'use client'

import { useState, useEffect } from 'react'
import { PortableText } from 'next-sanity'
import { portableTextComponents } from '@/components/ui/PortableTextComponents'
import { getCurrentUser } from '@/lib/auth-supabase'
import { checkUserPurchase } from '@/lib/purchases'
import PaymentButton from '@/components/PaymentButton'
import Link from 'next/link'

interface PostContentProps {
  post: any
  postImageUrl: string | null
}

export default function PostContent({ post, postImageUrl }: PostContentProps) {
  const [user, setUser] = useState<any>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        const currentUser = await getCurrentUser()
        console.log('🔍 PostContent: Utilisateur:', currentUser?.email)
        setUser(currentUser)

        if (currentUser) {
          const purchased = await checkUserPurchase(currentUser.id, post._id)
          console.log('🔍 PostContent: A acheté:', purchased)
          setHasPurchased(purchased)
        }
      } catch (error) {
        console.error('❌ Erreur vérification accès:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [post._id])

  const accessLevel = post.accessLevel || 'public'
  const hasAccess = 
    accessLevel === 'public' || 
    (accessLevel === 'members' && user) ||
    (accessLevel === 'premium' && user) // Temporaire: user au lieu de hasPurchased

  const contentToShow = hasAccess ? post.body : (post.previewContent || post.body)
  const isPremium = accessLevel === 'premium'
  const isMembers = accessLevel === 'members'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Vérification de l'accès...</span>
      </div>
    )
  }

  return (
    <>
      {/* Featured Image */}
      {postImageUrl && (
        <div className="container mx-auto max-w-4xl px-4 -mt-16">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 dark:ring-gray-800/20">
            <img
              src={postImageUrl}
              alt={post.image?.alt || post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
            {Array.isArray(post.body) && post.body.length > 0 ? (
              <div className={!hasAccess && (isPremium || isMembers) ? 'relative' : ''}>
                <PortableText value={post.body} components={portableTextComponents} />
                {!hasAccess && (isPremium || isMembers) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-gray-800/90 dark:via-gray-800/50 dark:to-transparent pointer-events-none"></div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-white">
                Aucun contenu disponible pour cet article.
              </p>
            )}
          </div>

          {/* Premium/Members Gate */}
          {!hasAccess && (isPremium || isMembers) && (
            <div className="mt-16 p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700/50 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {isPremium ? 'Contenu Premium' : 'Contenu Réservé aux Membres'}
                </h3>
                <p className="text-lg text-slate-600 dark:text-white mb-8 max-w-lg mx-auto leading-relaxed">
                  {isPremium 
                    ? `Pour accéder à l'intégralité de cet article premium${post.price ? ` (${post.price} CHF)` : ''}, effectuez votre achat ci-dessous.`
                    : 'Pour accéder à ce contenu réservé aux membres, veuillez vous connecter.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {isPremium && user && (
                    <PaymentButton
                      postId={post._id}
                      postTitle={post.title}
                      price={post.price || 0}
                      className="mb-4"
                    />
                  )}
                  {!user ? (
                    <>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Se connecter
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl border-2 border-blue-200 dark:border-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Nous contacter
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Demander l'accès
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  )
}
