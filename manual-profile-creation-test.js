// Test manuel de création de profil
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdylfeltqwvfhrnxjrek.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testManualProfileCreation() {
  console.log('🧪 Test manuel de création de profil...')
  console.log('')
  
  try {
    // Étape 1: Inscription d'un utilisateur
    console.log('1️⃣ Inscription d\'un utilisateur...')
    const timestamp = Date.now()
    const testEmail = `manual-test-${timestamp}@gmail.com`
    const testPassword = 'TestPassword123!'
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Manual',
          last_name: 'Test',
        },
      },
    })
    
    if (authError) {
      console.log('❌ Erreur d\'inscription:', authError.message)
      return
    }
    
    console.log('✅ Utilisateur créé:', authData.user?.id)
    console.log('   Email:', authData.user?.email)
    console.log('   Metadata:', authData.user?.user_metadata)
    console.log('')
    
    // Étape 2: Attendre un peu
    console.log('2️⃣ Attente (5 secondes)...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Étape 3: Vérifier si le profil existe
    console.log('3️⃣ Vérification du profil...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
    
    if (profileError) {
      console.log('❌ Erreur lors de la vérification:', profileError.message)
      return
    }
    
    console.log('   Profils trouvés:', profiles?.length || 0)
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Profil créé automatiquement!')
      console.log('   - ID:', profiles[0].id)
      console.log('   - Email:', profiles[0].email)
      console.log('   - Prénom:', profiles[0].first_name)
      console.log('   - Nom:', profiles[0].last_name)
    } else {
      console.log('❌ Aucun profil créé automatiquement')
      console.log('')
      
      // Étape 4: Création manuelle du profil
      console.log('4️⃣ Création manuelle du profil...')
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testEmail,
          first_name: 'Manual',
          last_name: 'Test',
        })
        .select()
      
      if (insertError) {
        console.log('❌ Erreur lors de l\'insertion manuelle:', insertError.message)
        console.log('   Code:', insertError.code)
        console.log('   Détails:', insertError.details)
        console.log('   Hint:', insertError.hint)
      } else {
        console.log('✅ Profil créé manuellement!')
        console.log('   - ID:', insertData[0].id)
        console.log('   - Email:', insertData[0].email)
      }
    }
    
    console.log('')
    console.log('📊 DIAGNOSTIC:')
    console.log('   - Utilisateur auth créé:', authData.user ? '✅' : '❌')
    console.log('   - Profil créé automatiquement:', profiles && profiles.length > 0 ? '✅' : '❌')
    console.log('   - Trigger fonctionne:', profiles && profiles.length > 0 ? '✅' : '❌')
    
    if (!profiles || profiles.length === 0) {
      console.log('')
      console.log('🚨 PROBLÈME IDENTIFIÉ:')
      console.log('   Le trigger on_auth_user_created ne fonctionne pas')
      console.log('   Vérifiez dans Supabase SQL Editor:')
      console.log('   1. La fonction handle_new_user existe-t-elle ?')
      console.log('   2. Le trigger on_auth_user_created existe-t-il ?')
      console.log('   3. Les permissions sont-elles correctes ?')
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

// Exécuter le test
testManualProfileCreation()
