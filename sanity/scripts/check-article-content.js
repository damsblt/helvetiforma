const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN || '', // Vous devrez ajouter votre token
})

async function checkArticleContent() {
  try {
    console.log('🔍 Vérification du contenu des articles...')
    
    // Récupérer tous les articles
    const articles = await client.fetch(`
      *[_type == "post"]{
        _id,
        title,
        slug,
        body,
        previewContent,
        accessLevel,
        price,
        publishedAt
      }
    `)
    
    console.log(`\n📊 ${articles.length} articles trouvés:`)
    
    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`)
      console.log(`   Slug: ${article.slug?.current || 'N/A'}`)
      console.log(`   Access Level: ${article.accessLevel || 'public'}`)
      console.log(`   Price: ${article.price || 'N/A'} CHF`)
      console.log(`   Published: ${article.publishedAt || 'N/A'}`)
      console.log(`   Body content: ${article.body ? `${Array.isArray(article.body) ? article.body.length : 'not array'} blocks` : 'EMPTY'}`)
      console.log(`   Preview content: ${article.previewContent ? `${Array.isArray(article.previewContent) ? article.previewContent.length : 'not array'} blocks` : 'EMPTY'}`)
      
      // Vérifier spécifiquement l'article test-2
      if (article.slug?.current === 'test-2') {
        console.log(`\n🎯 ARTICLE TEST-2 DÉTAILS:`)
        console.log(`   Body:`, JSON.stringify(article.body, null, 2))
        console.log(`   Preview:`, JSON.stringify(article.previewContent, null, 2))
      }
    })
    
    // Vérifier s'il y a des articles sans contenu
    const articlesWithoutContent = articles.filter(article => 
      (!article.body || (Array.isArray(article.body) && article.body.length === 0)) &&
      (!article.previewContent || (Array.isArray(article.previewContent) && article.previewContent.length === 0))
    )
    
    if (articlesWithoutContent.length > 0) {
      console.log(`\n⚠️  ${articlesWithoutContent.length} articles sans contenu:`)
      articlesWithoutContent.forEach(article => {
        console.log(`   - ${article.title} (${article.slug?.current})`)
      })
    } else {
      console.log(`\n✅ Tous les articles ont du contenu`)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  checkArticleContent()
}

module.exports = { checkArticleContent }
