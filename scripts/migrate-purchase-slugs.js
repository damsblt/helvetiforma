const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function migratePurchaseSlugs() {
  try {
    console.log('🔄 Starting purchase slug migration...')
    
    // 1. Get all purchases without postSlug
    const purchases = await client.fetch(`
      *[_type == "purchase" && !defined(postSlug)] {
        _id,
        postId,
        postTitle
      }
    `)
    
    console.log(`📊 Found ${purchases.length} purchases without postSlug`)
    
    if (purchases.length === 0) {
      console.log('✅ No purchases need migration')
      return
    }
    
    // 2. For each purchase, get the article slug
    for (const purchase of purchases) {
      try {
        console.log(`🔍 Processing purchase: ${purchase.postTitle} (${purchase.postId})`)
        
        // Get the article to find its slug
        const article = await client.fetch(`
          *[_type == "post" && _id == $postId][0] {
            _id,
            title,
            slug
          }
        `, { postId: purchase.postId })
        
        if (!article) {
          console.log(`❌ Article not found for purchase ${purchase._id}`)
          continue
        }
        
        if (!article.slug?.current) {
          console.log(`❌ Article has no slug: ${article.title}`)
          continue
        }
        
        // Update the purchase with the slug
        await client
          .patch(purchase._id)
          .set({ postSlug: article.slug.current })
          .commit()
        
        console.log(`✅ Updated purchase ${purchase._id} with slug: ${article.slug.current}`)
        
      } catch (error) {
        console.error(`❌ Error processing purchase ${purchase._id}:`, error)
      }
    }
    
    console.log('✅ Migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run the migration
migratePurchaseSlugs()
