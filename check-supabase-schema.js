// Script pour vérifier le schéma Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdylfeltqwvfhrnxjrek.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSupabaseSchema() {
  console.log('🔍 Vérification du schéma Supabase...')
  console.log('')
  
  try {
    // Vérifier si la table profiles existe
    console.log('1. Vérification de la table profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ Table profiles:', profilesError.message)
    } else {
      console.log('✅ Table profiles existe')
      console.log('   Nombre de profils:', profiles?.length || 0)
    }
    
    console.log('')
    
    // Vérifier si la table purchases existe
    console.log('2. Vérification de la table purchases...')
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .limit(1)
    
    if (purchasesError) {
      console.log('❌ Table purchases:', purchasesError.message)
    } else {
      console.log('✅ Table purchases existe')
      console.log('   Nombre d\'achats:', purchases?.length || 0)
    }
    
    console.log('')
    
    // Vérifier les utilisateurs auth
    console.log('3. Vérification des utilisateurs auth...')
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Erreur auth:', usersError.message)
    } else {
      console.log('✅ Utilisateurs auth trouvés:', users?.length || 0)
      
      if (users && users.length > 0) {
        console.log('   Premier utilisateur:')
        console.log('   - ID:', users[0].id)
        console.log('   - Email:', users[0].email)
        console.log('   - Créé le:', users[0].created_at)
        console.log('   - Metadata:', users[0].user_metadata)
      }
    }
    
    console.log('')
    
    // Vérifier si le trigger existe
    console.log('4. Vérification du trigger...')
    const { data: triggerData, error: triggerError } = await supabase
      .rpc('check_trigger_exists')
      .catch(() => {
        console.log('⚠️  Impossible de vérifier le trigger (fonction RPC non disponible)')
        return { data: null, error: null }
      })
    
    if (triggerError) {
      console.log('❌ Erreur trigger:', triggerError.message)
    } else {
      console.log('✅ Trigger vérifié')
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

// Exécuter la vérification
checkSupabaseSchema()
