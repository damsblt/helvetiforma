// Test de la page /register déployée
const https = require('https');

async function testRegisterPage() {
  console.log('🧪 Test de la page /register déployée...')
  console.log('')
  
  const APP_URL = 'https://helvetiforma.vercel.app'
  const REGISTER_URL = `${APP_URL}/register`
  
  try {
    // Test 1: Vérifier que la page est accessible
    console.log('1️⃣ Vérification de l\'accessibilité de la page...')
    const pageResponse = await fetch(REGISTER_URL)
    
    if (pageResponse.ok) {
      console.log('✅ Page /register accessible')
      console.log('   Status:', pageResponse.status)
      console.log('   Content-Type:', pageResponse.headers.get('content-type'))
    } else {
      console.log('❌ Page /register non accessible')
      console.log('   Status:', pageResponse.status)
      return
    }
    
    console.log('')
    
    // Test 2: Vérifier le contenu de la page
    console.log('2️⃣ Vérification du contenu de la page...')
    const pageContent = await pageResponse.text()
    
    // Vérifier la présence d'éléments clés
    const hasEmailInput = pageContent.includes('type="email"') || pageContent.includes('name="email"')
    const hasPasswordInput = pageContent.includes('type="password"') || pageContent.includes('name="password"')
    const hasSubmitButton = pageContent.includes('type="submit"') || pageContent.includes('button')
    const hasSupabaseScript = pageContent.includes('supabase') || pageContent.includes('NEXT_PUBLIC_SUPABASE')
    
    console.log('   Email input:', hasEmailInput ? '✅' : '❌')
    console.log('   Password input:', hasPasswordInput ? '✅' : '❌')
    console.log('   Submit button:', hasSubmitButton ? '✅' : '❌')
    console.log('   Supabase config:', hasSupabaseScript ? '✅' : '❌')
    
    console.log('')
    
    // Test 3: Vérifier les variables d'environnement côté client
    console.log('3️⃣ Vérification des variables d\'environnement...')
    const hasSiteUrl = pageContent.includes('helvetiforma.ch')
    const hasSupabaseUrl = pageContent.includes('qdylfeltqwvfhrnxjrek.supabase.co')
    
    console.log('   Site URL (helvetiforma.ch):', hasSiteUrl ? '✅' : '❌')
    console.log('   Supabase URL:', hasSupabaseUrl ? '✅' : '❌')
    
    console.log('')
    
    // Test 4: Instructions pour le test manuel
    console.log('4️⃣ Instructions pour le test manuel:')
    console.log('   Ouvrez votre navigateur et allez sur:', REGISTER_URL)
    console.log('   Inscrivez-vous avec un nouvel email')
    console.log('   Vérifiez dans Supabase → Table Editor → profiles')
    console.log('   Le profil devrait apparaître automatiquement')
    
    console.log('')
    
    // Test 5: Vérifier les logs de debug
    console.log('5️⃣ Vérification des logs de debug...')
    const hasDebugLogs = pageContent.includes('console.log') || pageContent.includes('🔧')
    console.log('   Logs de debug présents:', hasDebugLogs ? '✅' : '❌')
    
    if (hasDebugLogs) {
      console.log('   Ouvrez la console du navigateur (F12) pour voir les logs')
    }
    
    console.log('')
    console.log('📊 RÉSUMÉ:')
    console.log('   - Page accessible:', pageResponse.ok ? '✅' : '❌')
    console.log('   - Formulaire présent:', hasEmailInput && hasPasswordInput ? '✅' : '❌')
    console.log('   - Configuration Supabase:', hasSupabaseScript ? '✅' : '❌')
    console.log('   - URL de production:', hasSiteUrl ? '✅' : '❌')
    
    if (!pageResponse.ok || !hasEmailInput || !hasPasswordInput) {
      console.log('')
      console.log('🚨 PROBLÈME DÉTECTÉ:')
      console.log('   La page /register n\'est pas correctement déployée')
      console.log('   Redéployez l\'application sur Vercel')
    } else if (!hasSupabaseScript) {
      console.log('')
      console.log('⚠️  ATTENTION:')
      console.log('   Configuration Supabase manquante')
      console.log('   Vérifiez les variables d\'environnement Vercel')
    } else {
      console.log('')
      console.log('✅ Page /register semble correctement configurée')
      console.log('   Testez manuellement dans votre navigateur')
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message)
  }
}

// Exécuter le test
testRegisterPage()
