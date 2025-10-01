import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { sanityClient } from "@/lib/sanity";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = { next: { revalidate: 30 } };

export default async function PostsPage() {
  const posts = await sanityClient.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Articles & Actualités</h1>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            Aucun article publié pour le moment.
          </p>
          <p className="text-sm text-muted-foreground">
            Les articles seront affichés ici une fois publiés depuis le Sanity Studio.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-y-4">
          {posts.map((post) => (
            <li className="hover:underline" key={post._id}>
              <Link href={`/posts/${post.slug.current}`}>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
