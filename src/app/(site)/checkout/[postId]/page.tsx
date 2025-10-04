import { notFound } from 'next/navigation'
import { sanityClient } from '@/lib/sanity'
import CheckoutPage from './CheckoutPage'

interface CheckoutPageProps {
  params: Promise<{ postId: string }>
}

const POST_QUERY = `*[_type == "post" && _id == $postId][0]{
  _id,
  title,
  price,
  accessLevel,
  slug,
  previewContent,
  content,
  mainImage
}`

export default async function CheckoutPageWrapper({ params }: CheckoutPageProps) {
  const resolvedParams = await params
  const post = await sanityClient.fetch(POST_QUERY, { postId: resolvedParams.postId })

  if (!post) {
    notFound()
  }

  if (post.accessLevel !== 'premium' || !post.price) {
    notFound()
  }

  return <CheckoutPage post={post} />
}
