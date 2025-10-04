// Script simple pour tester le trigger
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdylfeltqwvfhrnxjrek.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTrigger() {
  console.log('🧪 Test simple du trigger de création de profil...')
  console.log('')
  
  // Générer un email unique
  const timestamp = Date.now()
  const testEmail = `trigger-test-${timestamp}@gmail.com`
  const testPassword = 'TestPassword123!'
  
  console.log('📧 Email de test:', testEmail)
  console.log('')
  
  try {
    // Étape 1: Compter les profils avant
    console.log('1️⃣ Comptage des profils avant inscription...')
    const { count: beforeCount, error: beforeError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (beforeError) {
      console.log('❌ Erreur:', beforeError.message)
      return
    }
    
    console.log('   Profils existants:', beforeCount || 0)
    console.log('')
    
    // Étape 2: Inscription
    console.log('2️⃣ Inscription d\'un nouvel utilisateur...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Trigger',
          last_name: 'Test',
        },
      },
    })
    
    if (authError) {
      console.log('❌ Erreur d\'inscription:', authError.message)
      return
    }
    
    console.log('✅ Inscription réussie!')
    console.log('   User ID:', authData.user?.id)
    console.log('')
    
    // Étape 3: Attendre et vérifier
    console.log('3️⃣ Attente du trigger (10 secondes)...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Étape 4: Compter les profils après
    console.log('4️⃣ Vérification des profils après inscription...')
    const { count: afterCount, error: afterError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (afterError) {
      console.log('❌ Erreur:', afterError.message)
      return
    }
    
    console.log('   Profils existants:', afterCount || 0)
    console.log('')
    
    // Étape 5: Vérifier le profil spécifique
    console.log('5️⃣ Recherche du profil créé...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
    
    if (profileError) {
      console.log('❌ Erreur:', profileError.message)
      return
    }
    
    console.log('📊 RÉSULTAT:')
    console.log('   Profils avant:', beforeCount || 0)
    console.log('   Profils après:', afterCount || 0)
    console.log('   Différence:', (afterCount || 0) - (beforeCount || 0))
    console.log('   Profil trouvé:', profiles?.length || 0)
    
    if (profiles && profiles.length > 0) {
      console.log('')
      console.log('✅ SUCCÈS! Trigger fonctionne:')
      console.log('   - ID:', profiles[0].id)
      console.log('   - Email:', profiles[0].email)
      console.log('   - Prénom:', profiles[0].first_name)
      console.log('   - Nom:', profiles[0].last_name)
    } else {
      console.log('')
      console.log('❌ ÉCHEC! Trigger ne fonctionne pas')
      console.log('   Le profil n\'a pas été créé automatiquement')
      console.log('')
      console.log('🚨 ACTION REQUISE:')
      console.log('   1. Allez dans Supabase Dashboard → SQL Editor')
      console.log('   2. Copiez le contenu de setup-supabase-schema.sql')
      console.log('   3. Exécutez le script complet')
      console.log('   4. Relancez ce test')
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

// Exécuter le test
testTrigger()
