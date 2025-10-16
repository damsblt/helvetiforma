import { NextRequest, NextResponse } from 'next/server'

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
const WORDPRESS_AUTH = Buffer.from(
  `${process.env.WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`
).toString('base64')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const postId = searchParams.get('id')
    
    let url = `${WORDPRESS_API_URL}/wp/v2/posts`
    
    if (slug) {
      url += `?slug=${slug}`
    } else if (postId) {
      url += `/${postId}`
    } else {
      url += '?per_page=10'
    }

    // Fetch WordPress posts
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${WORDPRESS_AUTH}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    let posts = await response.json()
    
    // Ensure posts is an array
    if (!Array.isArray(posts)) {
      posts = [posts]
    }

    // Fetch ACF data for each post
    const postsWithACF = await Promise.all(
      posts.map(async (post: any) => {
        try {
          // Get ACF fields for this post
          const acfResponse = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/acf/v3/posts/${post.id}`,
            {
              headers: {
                'Authorization': `Basic ${WORDPRESS_AUTH}`,
                'Content-Type': 'application/json'
              }
            }
          )

          let acfData = {}
          if (acfResponse.ok) {
            acfData = await acfResponse.json()
          }

          // Format the post data
          return {
            _id: post.id,
            id: post.id,
            title: post.title.rendered,
            slug: { current: post.slug },
            excerpt: post.excerpt.rendered,
            body: post.content.rendered,
            publishedAt: post.date,
            accessLevel: (acfData as any).access || (acfData as any).access_level || 'public',
            price: parseFloat((acfData as any).price) || 0,
            image: post.featured_media ? await getFeaturedImage(post.featured_media) : null,
            category: post.categories?.[0] ? await getCategoryName(post.categories[0]) : null,
            tags: post.tags ? await getTagNames(post.tags) : [],
            acf: acfData
          }
        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error)
          return {
            _id: post.id,
            id: post.id,
            title: post.title.rendered,
            slug: { current: post.slug },
            excerpt: post.excerpt.rendered,
            body: post.content.rendered,
            publishedAt: post.date,
            accessLevel: 'public',
            price: 0,
            image: null,
            category: null,
            tags: [],
            acf: {}
          }
        }
      })
    )

    // Return single post if slug or id was specified
    if (slug || postId) {
      return NextResponse.json(postsWithACF[0])
    }

    return NextResponse.json(postsWithACF)

  } catch (error) {
    console.error('Error fetching WordPress posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

async function getFeaturedImage(mediaId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/media/${mediaId}`,
      {
        headers: {
          'Authorization': `Basic ${WORDPRESS_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.ok) {
      const media = await response.json()
      return media.source_url
    }
  } catch (error) {
    console.error('Error fetching featured image:', error)
  }
  return null
}

async function getCategoryName(categoryId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/categories/${categoryId}`,
      {
        headers: {
          'Authorization': `Basic ${WORDPRESS_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.ok) {
      const category = await response.json()
      return category.name
    }
  } catch (error) {
    console.error('Error fetching category:', error)
  }
  return null
}

async function getTagNames(tagIds: number[]): Promise<string[]> {
  try {
    const tagPromises = tagIds.map(tagId =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/tags/${tagId}`,
        {
          headers: {
            'Authorization': `Basic ${WORDPRESS_AUTH}`,
            'Content-Type': 'application/json'
          }
        }
      ).then(res => res.ok ? res.json() : null)
    )

    const tags = await Promise.all(tagPromises)
    return tags.filter(tag => tag).map(tag => tag.name)
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
  return []
}
