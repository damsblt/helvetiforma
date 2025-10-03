import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityClient } from "@/lib/sanity";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { portableTextComponents } from "@/components/ui/PortableTextComponents";
import { checkUserPurchase } from "@/lib/purchases";
import PaymentButton from "@/components/PaymentButton";
import type { Metadata } from "next";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ...,
  "author": author->{name, image},
  "categoryTitle": category,
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
  const session = await auth();
  
  if (!post) {
    notFound();
  }

  const postImageUrl = post.image
    ? urlFor(post.image)?.width(1200).height(600).url()
    : null;

  // Access control logic
  const accessLevel = post.accessLevel || 'public';
  const hasPurchased = session?.user ? await checkUserPurchase(session.user.id || session.user.email!, post._id) : false;
  const hasAccess = 
    accessLevel === 'public' || 
    (accessLevel === 'members' && session?.user) ||
    (accessLevel === 'premium' && hasPurchased);

  // Determine what content to show
  const contentToShow = hasAccess ? post.body : post.previewContent;
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <Link 
            href="/posts" 
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux articles
      </Link>
          
          <div className="flex items-center gap-3 mb-4">
            {getAccessBadge()}
            {post.categoryTitle && (
              <span className="text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full">
                {post.categoryTitle}
              </span>
            )}
          </div>
          
          <h1 className="text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
          
          {post.excerpt && (
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-white/80">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
            {post.tags && post.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-2">
                  {post.tags.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="text-white/70">#{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {postImageUrl && (
        <div className="container mx-auto max-w-4xl px-4 -mt-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
        <img
          src={postImageUrl}
              alt={post.image?.alt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {Array.isArray(contentToShow) && contentToShow.length > 0 ? (
              <PortableText value={contentToShow} components={portableTextComponents} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Aucun contenu disponible pour cet article.
              </p>
            )}
          </div>

          {/* Premium/Members Gate */}
          {!hasAccess && (isPremium || isMembers) && (
            <div className="mt-12 p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border-2 border-primary-200 dark:border-primary-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {isPremium ? 'Contenu Premium' : 'Contenu Réservé aux Membres'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  {isPremium 
                    ? `Pour accéder à l'intégralité de cet article premium${post.price ? ` (${post.price} CHF)` : ''}, effectuez votre achat ci-dessous.`
                    : 'Pour accéder à ce contenu réservé aux membres, veuillez vous connecter.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {isPremium && session?.user && (
                    <PaymentButton
                      postId={post._id}
                      postTitle={post.title}
                      price={post.price || 0}
                      className="mb-4"
                    />
                  )}
                  {!session?.user ? (
                    <>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Se connecter
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 font-semibold rounded-lg border-2 border-primary-600 dark:border-primary-400 transition-colors"
                      >
                        Nous contacter
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Demander l'accès
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PDF Attachments Section */}
          {post.pdfAttachments && post.pdfAttachments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Documents PDF joints
              </h4>
              <div className="space-y-3">
                {post.pdfAttachments.map((pdf: any, index: number) => {
                  const isPdfPremium = pdf.isPremium && !hasAccess;
                  const fileUrl = pdf.file?.asset?.url;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isPdfPremium
                          ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          isPdfPremium 
                            ? 'bg-yellow-200 dark:bg-yellow-800' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {isPdfPremium ? (
                            <svg className="w-6 h-6 text-yellow-700 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="text-base font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                {pdf.title}
                                {pdf.isPremium && (
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                                    Premium
                                  </span>
                                )}
                              </h5>
                              {pdf.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {pdf.description}
                                </p>
                              )}
                              {pdf.fileSize && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Taille: {pdf.fileSize}
                                </p>
                              )}
                            </div>
                            {isPdfPremium ? (
                              <button
                                disabled
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2"
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
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
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
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
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
