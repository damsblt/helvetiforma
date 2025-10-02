import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityClient } from "@/lib/sanity";
import Link from "next/link";
import { notFound } from "next/navigation";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = sanityClient.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await sanityClient.fetch(POST_QUERY, resolvedParams, options) as SanityDocument | null;
  
  if (!post) {
    notFound();
  }

  const postImageUrl = post.image
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/posts" className="hover:underline text-primary">
        ← Retour aux articles
      </Link>
      {postImageUrl && (
        <img
          src={postImageUrl}
          alt={post.title}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground">
          Publié le {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
        </p>
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </div>
    </main>
  );
}
