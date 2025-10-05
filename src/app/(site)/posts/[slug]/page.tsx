import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityClient } from "@/lib/sanity";
import Link from "next/link";
import { notFound } from "next/navigation";
import { portableTextComponents } from "@/components/ui/PortableTextComponents";
import { checkUserPurchaseWithSession } from "@/lib/purchases";
import PaymentButton from "@/components/PaymentButton";
import PurchaseSuccessMessage from "@/components/PurchaseSuccessMessage";
import { getServerSession } from 'next-auth';
import { noEmailAuthOptions } from '@/lib/auth-no-email';
import type { Metadata } from "next";
import ClientPostContent from "@/components/ClientPostContent";

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
  
  // Récupérer la session utilisateur avec NextAuth
  const session = await getServerSession(noEmailAuthOptions);
  
  
  if (!post) {
    notFound();
  }

  const postImageUrl = post.image
    ? urlFor(post.image)?.width(1200).height(600).url()
    : null;

  // Access control logic
  const accessLevel = post.accessLevel || 'public';
  const hasPurchased = await checkUserPurchaseWithSession(post._id);
  
  const hasAccess = 
    accessLevel === 'public' || 
    (accessLevel === 'members' && !!session?.user) ||
    (accessLevel === 'premium' && hasPurchased);



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
      <PurchaseSuccessMessage />
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

      {/* Content Section - Using Client Component for Payment Success Handling */}
      <ClientPostContent 
        post={post}
        postImageUrl={postImageUrl}
        initialHasAccess={hasAccess}
        initialHasPurchased={hasPurchased}
      />
    </main>
  );
}
