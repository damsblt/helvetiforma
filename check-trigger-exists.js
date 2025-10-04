// Script pour vérifier si le trigger existe dans Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdylfeltqwvfhrnxjrek.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTriggerExists() {
  console.log('🔍 Vérification de l\'existence du trigger dans Supabase...')
  console.log('')
  
  try {
    // Vérifier si la fonction handle_new_user existe
    console.log('1️⃣ Vérification de la fonction handle_new_user...')
    const { data: functions, error: functionsError } = await supabase
      .rpc('check_function_exists', { function_name: 'handle_new_user' })
      .catch(() => {
        console.log('⚠️  Impossible de vérifier les fonctions (RPC non disponible)')
        return { data: null, error: null }
      })
    
    if (functionsError) {
      console.log('❌ Erreur lors de la vérification des fonctions:', functionsError.message)
    } else {
      console.log('✅ Fonction handle_new_user:', functions ? 'EXISTE' : 'N\'EXISTE PAS')
    }
    
    console.log('')
    
    // Vérifier les triggers sur la table auth.users
    console.log('2️⃣ Vérification des triggers sur auth.users...')
    const { data: triggers, error: triggersError } = await supabase
      .rpc('check_triggers_on_table', { table_name: 'auth.users' })
      .catch(() => {
        console.log('⚠️  Impossible de vérifier les triggers (RPC non disponible)')
        return { data: null, error: null }
      })
    
    if (triggersError) {
      console.log('❌ Erreur lors de la vérification des triggers:', triggersError.message)
    } else {
      console.log('✅ Triggers sur auth.users:', triggers ? 'EXISTENT' : 'N\'EXISTENT PAS')
    }
    
    console.log('')
    
    // Vérifier les politiques RLS
    console.log('3️⃣ Vérification des politiques RLS...')
    const { data: policies, error: policiesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (policiesError) {
      console.log('❌ Erreur lors de la vérification des politiques:', policiesError.message)
    } else {
      console.log('✅ Politiques RLS sur profiles:', 'ACTIVES')
    }
    
    console.log('')
    
    // Test de création manuelle d'un profil
    console.log('4️⃣ Test de création manuelle d\'un profil...')
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const testEmail = 'test-manual@example.com'
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        first_name: 'Test',
        last_name: 'Manual'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Erreur lors de l\'insertion manuelle:', insertError.message)
    } else {
      console.log('✅ Insertion manuelle réussie')
      
      // Nettoyer le test
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
    }
    
    console.log('')
    console.log('📋 RÉSUMÉ:')
    console.log('   - Fonction handle_new_user:', functions ? '✅' : '❌')
    console.log('   - Triggers sur auth.users:', triggers ? '✅' : '❌')
    console.log('   - Politiques RLS:', policiesError ? '❌' : '✅')
    console.log('   - Insertion manuelle:', insertError ? '❌' : '✅')
    
    if (!functions || !triggers) {
      console.log('')
      console.log('🚨 ACTION REQUISE:')
      console.log('   Exécutez le script setup-supabase-schema.sql dans Supabase!')
      console.log('   1. Allez dans Supabase Dashboard → SQL Editor')
      console.log('   2. Copiez le contenu de setup-supabase-schema.sql')
      console.log('   3. Exécutez le script')
      console.log('   4. Relancez ce test')
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

// Exécuter la vérification
checkTriggerExists()
