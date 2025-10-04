// Test de connexion Supabase
const { createClient } = require('@supabase/supabase-js')

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Test de connexion Supabase...')
console.log('URL:', supabaseUrl)
console.log('Clé (début):', supabaseAnonKey?.substring(0, 20) + '...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n🧪 Test de connexion...')
    
    // Test de connexion basique
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      return
    }
    
    console.log('✅ Connexion Supabase réussie!')
    console.log('📊 Données reçues:', data)
    
    // Test d'authentification
    console.log('\n🔐 Test d\'authentification...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('ℹ️  Aucune session active (normal)')
    } else {
      console.log('✅ Session d\'authentification OK')
    }
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message)
  }
}

testConnection()
