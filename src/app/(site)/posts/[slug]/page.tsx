import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityClient } from "@/lib/sanity";
import Link from "next/link";
import { notFound } from "next/navigation";
import { portableTextComponents } from "@/components/ui/PortableTextComponents";
import { checkUserPurchase } from "@/lib/purchases";
import PaymentButton from "@/components/PaymentButton";
import { getSupabaseClient } from '@/lib/supabase';
import DebugInfo from '@/components/DebugInfo';
import type { Metadata } from "next";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ...,
  "author": author->{name, image},
  "categoryTitle": category,
  body,
  previewContent,
  accessLevel,
  price,
  pdfAttachments[]{
    ...,
    file{
      asset->{
        _id,
        url
      }
    }
  }
}`;

const { projectId, dataset } = sanityClient.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await sanityClient.fetch(POST_QUERY, resolvedParams, options) as SanityDocument | null;
  
  if (!post) {
    return {
      title: 'Article non trouvé',
    };
  }

  const imageUrl = post.image ? urlFor(post.image)?.width(1200).height(630).url() : undefined;

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    keywords: post.seo?.keywords?.join(', '),
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      type: 'article',
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await sanityClient.fetch(POST_QUERY, resolvedParams, options) as SanityDocument | null;
  
  // Initialiser Supabase
  const supabase = getSupabaseClient();
  
  // Récupérer la session utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  
  // Debug server-side session
  console.log('🔍 SERVER-SIDE SESSION DEBUG:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    timestamp: new Date().toISOString()
  });
  
  if (!post) {
    notFound();
  }

  const postImageUrl = post.image
    ? urlFor(post.image)?.width(1200).height(600).url()
    : null;

  // Access control logic
  const accessLevel = post.accessLevel || 'public';
  const hasPurchased = session?.user ? await checkUserPurchase(session.user.id, post._id) : false;
  
  const hasAccess = 
    accessLevel === 'public' || 
    (accessLevel === 'members' && session?.user) ||
    (accessLevel === 'premium' && hasPurchased);

  // Debug logging
  console.log('🔍 DEBUG POST ACCESS:', {
    postTitle: post.title,
    accessLevel,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    hasPurchased,
    hasAccess,
    postId: post._id,
    timestamp: new Date().toISOString()
  });

  // Additional debugging for production
  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 PRODUCTION DEBUG - User session exists:', !!session?.user);
    console.log('🚀 PRODUCTION DEBUG - User ID:', session?.user?.id);
    console.log('🚀 PRODUCTION DEBUG - Post ID:', post._id);
    console.log('🚀 PRODUCTION DEBUG - Has purchased:', hasPurchased);
    console.log('🚀 PRODUCTION DEBUG - Has access:', hasAccess);
  }

  // Determine what content to show
  const contentToShow = hasAccess ? post.body : (post.previewContent || post.body);
  const isPremium = accessLevel === 'premium';
  const isMembers = accessLevel === 'members';

  // Access level badge
  const getAccessBadge = () => {
    if (isPremium) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Premium
        </span>
      );
    }
    if (isMembers) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Membres
        </span>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-800/90"></div>
        <div className="relative container mx-auto max-w-4xl px-4 py-20">
          <Link 
            href="/posts" 
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-all duration-200 hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux articles
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            {getAccessBadge()}
            {post.categoryTitle && (
              <span className="text-sm text-white/90 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                {post.categoryTitle}
              </span>
            )}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/85">
            <time dateTime={post.publishedAt} className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-white/60">•</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="text-white/80 bg-white/10 px-2 py-1 rounded-md text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
        {/* Debug Info - Remove in production */}
        <DebugInfo postId={post._id} />
        
        <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
            {Array.isArray(post.body) && post.body.length > 0 ? (
              <div className={!hasAccess && (isPremium || isMembers) ? 'relative' : ''}>
                <PortableText value={post.body} components={portableTextComponents} />
                {!hasAccess && (isPremium || isMembers) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-gray-800/90 dark:via-gray-800/50 dark:to-transparent pointer-events-none"></div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
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
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                  {isPremium 
                    ? `Pour accéder à l'intégralité de cet article premium${post.price ? ` (${post.price} CHF)` : ''}, effectuez votre achat ci-dessous.`
                    : 'Pour accéder à ce contenu réservé aux membres, veuillez vous connecter.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {isPremium ? (
                    <Link
                      href={`/checkout/${post._id}`}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Acheter pour {post.price} CHF
                    </Link>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/posts/${post.slug.current}`)}`}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se connecter
                    </Link>
                  )}
                  
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl border-2 border-blue-200 dark:border-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* PDF Attachments Section */}
          {post.pdfAttachments && post.pdfAttachments.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-gray-700/60">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                Documents PDF joints
              </h4>
              <div className="space-y-4">
                {post.pdfAttachments.map((pdf: any, index: number) => {
                  const isPdfPremium = pdf.isPremium && !hasAccess;
                  const fileUrl = pdf.file?.asset?.url;
                  
                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                        isPdfPremium
                          ? 'border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10'
                          : 'border-slate-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-blue-300 dark:hover:border-blue-600 backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-start gap-5">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                          isPdfPremium 
                            ? 'bg-gradient-to-br from-amber-200 to-yellow-200 dark:from-amber-800 dark:to-yellow-800' 
                            : 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30'
                        }`}>
                          {isPdfPremium ? (
                            <svg className="w-7 h-7 text-amber-700 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                {pdf.title}
                                {pdf.isPremium && (
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full">
                                    Premium
                                  </span>
                                )}
                              </h5>
                              {pdf.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                                  {pdf.description}
                                </p>
                              )}
                              {pdf.fileSize && (
                                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                  Taille: {pdf.fileSize}
                                </p>
                              )}
                            </div>
                            {isPdfPremium ? (
                              <button
                                disabled
                                className="px-5 py-3 bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed flex items-center gap-2 shadow-sm"
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
                                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-gray-700/60">
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </h4>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
