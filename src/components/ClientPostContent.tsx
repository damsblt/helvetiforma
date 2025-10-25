'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import OptimizedPaymentButton from '@/components/OptimizedPaymentButton'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import '@/styles/wordpress-blocks.css'
import '@/styles/dark-mode-tables.css'

interface ClientPostContentProps {
  post: any
  postImageUrl: string | null | undefined
  initialHasAccess: boolean
  initialHasPurchased: boolean
}

export default function ClientPostContent({ 
  post, 
  postImageUrl, 
  initialHasAccess, 
  initialHasPurchased 
}: ClientPostContentProps) {
  const { user, isAuthenticated } = useAuth()
  const [hasPurchased, setHasPurchased] = useState(initialHasPurchased)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'

  // Check if user has already purchased this article
  useEffect(() => {
    const checkExistingPurchase = async () => {
      if (!user || !isAuthenticated) {
        console.log('🔍 No user authenticated, skipping purchase check')
        return
      }

      try {
        console.log('🔍 Checking existing purchase for user:', user.id, 'post:', post._id || post.id)
        const response = await fetch(`/api/check-purchase?postId=${post._id || post.id}&userId=${user.id}`)
        const data = await response.json()
        
        console.log('🔍 Purchase check result:', data)
        
        if (data.hasPurchased) {
          console.log('✅ User has already purchased this article')
          setHasPurchased(true)
        } else {
          console.log('❌ User has not purchased this article')
          setHasPurchased(false)
        }
      } catch (error) {
        console.error('❌ Error checking existing purchase:', error)
      }
    }

    checkExistingPurchase()
  }, [user?.id, isAuthenticated, post._id, post.id])

  // Auto-refresh when payment success is detected
  useEffect(() => {
    if (paymentSuccess) {
      console.log('🔍 Payment success detected, unlocking content immediately...')
      setLoading(true)
      
      // If user is logged in, unlock content immediately
      if (user) {
        console.log('🔍 User is logged in, unlocking content...')
        setHasPurchased(true)
        
        // Record the purchase in WooCommerce
        const recordPurchase = async () => {
          try {
            console.log('🔍 Recording purchase in WooCommerce...')
            const response = await fetch('/api/payment/record-purchase', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                postId: post._id || post.id,
                userId: user.id,
                amount: post.price || 0
              })
            })
            
            if (response.ok) {
              console.log('✅ Purchase recorded successfully')
            } else {
              console.error('❌ Failed to record purchase')
            }
          } catch (error) {
            console.error('❌ Error recording purchase:', error)
          }
        }
        
        recordPurchase()
        setLoading(false)
        
        // Remove the payment success parameter from URL to clean it up
        const url = new URL(window.location.href)
        url.searchParams.delete('payment')
        window.history.replaceState({}, '', url.toString())
      } else {
        // User not logged in - this shouldn't happen in normal flow
        console.log('⚠️ Payment success but user not logged in - this is unexpected')
        setLoading(false)
      }
    }
  }, [paymentSuccess, user?.id, post._id, post.id, post.price])

  const accessLevel = post.accessLevel || 'public'
  const hasAccess = 
    accessLevel === 'public' || 
    (accessLevel === 'members' && user) ||
    (accessLevel === 'premium' && hasPurchased)

  const contentToShow = hasAccess ? post.body : (post.previewContent || post.body)
  const isPremium = accessLevel === 'premium'
  const isMembers = accessLevel === 'members'

  // Show payment success message for non-authenticated users
  if (paymentSuccess && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Paiement réussi !
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Votre paiement a été traité avec succès. Veuillez vous connecter pour accéder à votre article premium.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Se connecter pour accéder
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }


  // Show loading state while user is loading or purchase verification is in progress
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          {paymentSuccess ? 'Vérification de votre achat...' : 'Vérification de l\'accès...'}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
            {post.body && post.body.trim() !== '' ? (
              <div className={!hasAccess && (isPremium || isMembers) ? 'relative' : ''}>
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-ul:text-slate-700 dark:prose-ul:text-slate-300 prose-ol:text-slate-700 dark:prose-ol:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: post.body }}
                />
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
                  {paymentSuccess && !user ? (
                    <>
                      <span className="text-green-600 dark:text-green-400 font-semibold">✅ Paiement réussi !</span>
                      <br />
                      Veuillez vous connecter pour accéder à votre contenu premium.
                    </>
                  ) : isPremium ? (
                    `Pour accéder à l'intégralité de cet article premium${post.price ? ` (${post.price} CHF)` : ''}, effectuez votre achat ci-dessous.`
                  ) : (
                    'Pour accéder à ce contenu réservé aux membres, veuillez vous connecter.'
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Chargement...</span>
                    </div>
                  ) : paymentSuccess && !user ? (
                    // Payment success but not logged in - show login button
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se connecter pour accéder
                    </Link>
                  ) : isPremium ? (
                    // Premium content - always show OptimizedPaymentButton (handles login redirect internally)
                    <OptimizedPaymentButton
                      postId={post._id?.toString() || post.id?.toString() || ''}
                      postTitle={post.title}
                      postSlug={post.slug}
                      price={post.price || 0}
                      className="mb-4"
                    />
                  ) : user ? (
                    // Members content + logged in - show contact button
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Demander l'accès
                    </Link>
                  ) : (
                    // Members content + not logged in - show login button
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
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PDF Attachments Section - Only show if user has access or if there are free PDFs */}
          {post.pdfAttachments && post.pdfAttachments.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-200/60 dark:border-gray-700/60">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Documents PDF joints
                </h3>
                <p className="text-slate-600 dark:text-white">
                  Téléchargez les documents complémentaires à cet article
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {post.pdfAttachments.map((pdf: any, index: number) => {
                  // Pour les PDFs, on utilise leur propre statut premium ET l'accès global
                  // Si l'utilisateur a acheté l'article, il peut télécharger tous les PDFs
                  const isPdfPremium = pdf.isPremium && !hasAccess;
                  const fileUrl = pdf.url; // Utiliser pdf.url au lieu de pdf.file?.asset?.url
                  
                  console.log('🔍 PDF debug:', { 
                    title: pdf.title, 
                    isPremium: pdf.isPremium, 
                    hasAccess, 
                    isPdfPremium, 
                    fileUrl 
                  });
                  
                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                        isPdfPremium
                          ? 'border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10'
                          : 'border-slate-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-blue-300 dark:hover:border-blue-600 backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                          isPdfPremium 
                            ? 'bg-gradient-to-br from-amber-200 to-yellow-200 dark:from-amber-800 dark:to-yellow-800' 
                            : 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30'
                        }`}>
                          {isPdfPremium ? (
                            <svg className="w-6 h-6 text-amber-700 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3">
                            <div>
                              <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                {pdf.title}
                                {pdf.isPremium && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full">
                                    Premium
                                  </span>
                                )}
                              </h5>
                              {pdf.description && (
                                <p className="text-sm text-slate-600 dark:text-white mb-2 leading-relaxed">
                                  {pdf.description}
                                </p>
                              )}
                              {pdf.fileSize && (
                                <p className="text-xs text-slate-500 dark:text-white font-medium">
                                  Taille: {pdf.fileSize}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-end">
                              {isPdfPremium ? (
                                <button
                                  disabled
                                  className="px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-white rounded-xl text-sm font-medium cursor-not-allowed flex items-center gap-2 shadow-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  Verrouillé
                                </button>
                              ) : fileUrl ? (
                                <a
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Télécharger
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Show message if PDFs are locked */}
              {post.pdfAttachments.some((pdf: any) => pdf.isPremium && !hasAccess) && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Certains documents PDF sont réservés aux membres premium. Achetez l'article pour y accéder.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-gray-700/60">
              <h4 className="text-sm font-semibold text-slate-500 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </h4>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-white text-sm font-medium rounded-full hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  )
}
