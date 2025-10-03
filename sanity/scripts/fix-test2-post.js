import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function fixTest2Post() {
  try {
    console.log('🔍 Recherche des posts "test 2"...')
    
    // Get all posts with slug "test 2"
    const posts = await client.fetch('*[_type == "post" && slug.current == "test 2"]')
    console.log('📊 Posts trouvés avec slug "test 2":', posts.length)
    
    if (posts.length === 0) {
      console.log('❌ Aucun post "test 2" trouvé')
      return
    }
    
    if (posts.length === 1) {
      console.log('✅ Un seul post "test 2" trouvé, correction du slug...')
      const post = posts[0]
      
      // Update the slug to remove space
      await client.patch(post._id).set({
        slug: {
          current: 'test-2',
          _type: 'slug'
        }
      }).commit()
      
      console.log('✅ Slug corrigé: "test 2" -> "test-2"')
      
    } else {
      console.log('⚠️ Plusieurs posts "test 2" trouvés, suppression des doublons...')
      
      // Keep the most recent one
      const sortedPosts = posts.sort((a, b) => new Date(b._updatedAt) - new Date(a._updatedAt))
      const keepPost = sortedPosts[0]
      const deletePosts = sortedPosts.slice(1)
      
      console.log('📝 Post à conserver:', keepPost.title, '(ID:', keepPost._id, ')')
      console.log('🗑️ Posts à supprimer:', deletePosts.length)
      
      // Update the slug of the kept post
      await client.patch(keepPost._id).set({
        slug: {
          current: 'test-2',
          _type: 'slug'
        }
      }).commit()
      
      console.log('✅ Slug corrigé: "test 2" -> "test-2"')
      
      // Delete duplicate posts
      for (const post of deletePosts) {
        await client.delete(post._id)
        console.log('🗑️ Post supprimé:', post._id)
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Vérification...')
    const testPost = await client.fetch('*[_type == "post" && slug.current == "test-2"][0]')
    if (testPost) {
      console.log('✅ Post "test-2" trouvé:', testPost.title)
      console.log('📅 PublishedAt:', testPost.publishedAt)
    } else {
      console.log('❌ Post "test-2" non trouvé')
    }
    
    // Test the posts query
    const allPosts = await client.fetch('*[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}')
    console.log('\n📊 Tous les posts:')
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} - Slug: ${post.slug.current}`)
    })
    
    console.log('\n🎉 Correction terminée!')
    console.log('💡 Le post est maintenant accessible via: /posts/test-2')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  }
}

fixTest2Post()
