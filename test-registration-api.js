// Script de test pour l'inscription via l'API Vercel
const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdylfeltqwvfhrnxjrek.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// URL de l'application déployée
const APP_URL = 'https://helvetiforma.vercel.app'

async function testRegistrationFlow() {
  console.log('🧪 Test du flux d\'inscription via API Vercel...')
  console.log('')
  
  // Générer un email unique pour le test
  const timestamp = Date.now()
  const testEmail = `test-${timestamp}@gmail.com`
  const testPassword = 'TestPassword123!'
  
  console.log('📧 Email de test:', testEmail)
  console.log('🔑 Mot de passe:', testPassword)
  console.log('')
  
  try {
    // Étape 1: Vérifier l'état initial des profils
    console.log('1️⃣ Vérification de l\'état initial...')
    const { data: initialProfiles, error: initialError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
    
    if (initialError) {
      console.log('❌ Erreur lors de la vérification initiale:', initialError.message)
      return
    }
    
    console.log('✅ Profils existants avec cet email:', initialProfiles?.length || 0)
    console.log('')
    
    // Étape 2: Tentative d'inscription via Supabase
    console.log('2️⃣ Tentative d\'inscription via Supabase...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        },
      },
    })
    
    if (authError) {
      console.log('❌ Erreur d\'inscription:', authError.message)
      return
    }
    
    console.log('✅ Inscription Supabase réussie!')
    console.log('   User ID:', authData.user?.id)
    console.log('   Email confirmé:', authData.user?.email_confirmed_at ? 'Oui' : 'Non')
    console.log('')
    
    // Étape 3: Attendre un peu pour que le trigger se déclenche
    console.log('3️⃣ Attente du déclenchement du trigger (5 secondes)...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Étape 4: Vérifier si le profil a été créé
    console.log('4️⃣ Vérification de la création du profil...')
    const { data: newProfiles, error: newError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
    
    if (newError) {
      console.log('❌ Erreur lors de la vérification du profil:', newError.message)
      return
    }
    
    console.log('📊 Résultat:')
    console.log('   Profils trouvés:', newProfiles?.length || 0)
    
    if (newProfiles && newProfiles.length > 0) {
      console.log('✅ SUCCÈS! Profil créé automatiquement:')
      console.log('   - ID:', newProfiles[0].id)
      console.log('   - Email:', newProfiles[0].email)
      console.log('   - Prénom:', newProfiles[0].first_name)
      console.log('   - Nom:', newProfiles[0].last_name)
      console.log('   - Créé le:', newProfiles[0].created_at)
    } else {
      console.log('❌ ÉCHEC! Aucun profil créé automatiquement')
      console.log('   Le trigger ne fonctionne pas correctement')
    }
    
    console.log('')
    
    // Étape 5: Nettoyage (optionnel)
    console.log('5️⃣ Nettoyage...')
    if (authData.user) {
      // Note: La suppression d'utilisateur nécessite des permissions admin
      console.log('⚠️  Utilisateur créé pour les tests - à supprimer manuellement si nécessaire')
      console.log('   User ID à supprimer:', authData.user.id)
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

// Exécuter le test
testRegistrationFlow()
