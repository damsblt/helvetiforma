import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { sanityClient } from "@/lib/sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkUserPurchaseWithSession } from '@/lib/purchases'

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{
  _id, 
  title, 
  slug, 
  publishedAt,
  excerpt,
  image,
  accessLevel,
  price,
  category,
  tags
}`;

const { projectId, dataset } = sanityClient.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function PostsPage() {
  const posts = await sanityClient.fetch(POSTS_QUERY, {}, options) as SanityDocument[];
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Articles & Actualités
          </h1>
          <p className="text-xl text-slate-600 dark:text-white max-w-2xl mx-auto leading-relaxed">
            Découvrez nos derniers articles, analyses et actualités sur la formation professionnelle
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Aucun article publié pour le moment
            </h3>
            <p className="text-slate-600 dark:text-white max-w-md mx-auto">
              Les articles seront affichés ici une fois publiés depuis le Sanity Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(async (post) => {
              const postImageUrl = post.image
                ? urlFor(post.image)?.width(600).height(400).url()
                : null;
              
              const accessLevel = post.accessLevel || 'public';
              const hasPurchased = await checkUserPurchaseWithSession(post._id);
              const hasAccess = 
                accessLevel === 'public' || 
                (accessLevel === 'members' && user) ||
                (accessLevel === 'premium' && hasPurchased);

              const getAccessBadge = () => {
                if (accessLevel === 'premium') {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Premium
                    </span>
                  );
                }
                if (accessLevel === 'members') {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Membres
                    </span>
                  );
                }
                return null;
              };

              return (
                <article
                  key={post._id}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 dark:border-gray-700/20 hover:-translate-y-2"
                >
                  <Link href={`/posts/${post.slug.current}`} className="block">
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      {postImageUrl ? (
                        <img
                          src={postImageUrl}
                          alt={post.image?.alt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                          <svg className="w-16 h-16 text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        {getAccessBadge()}
                      </div>
                      {!hasAccess && (accessLevel === 'premium' || accessLevel === 'members') && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="text-center text-white">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <p className="text-sm font-medium">
                              {accessLevel === 'premium' ? 'Contenu Premium' : 'Réservé aux Membres'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category */}
                      {post.category && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-slate-600 dark:text-white text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white text-xs rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-gray-700">
                        <time 
                          dateTime={post.publishedAt} 
                          className="text-sm text-slate-500 dark:text-white"
                        >
                          {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </time>
                        {accessLevel === 'premium' && post.price && (
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {post.price} CHF
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
