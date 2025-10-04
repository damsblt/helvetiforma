// Script pour tester l'envoi d'emails Supabase
const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdylfeltqwvfhrnxjrek.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testEmailSending() {
  console.log('🧪 Test d\'envoi d\'email Supabase...')
  console.log('')
  
  console.log('Configuration:')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Anon Key:', supabaseAnonKey ? 'DÉFINIE' : 'NON DÉFINIE')
  console.log('')
  
  // Test avec une URL de redirection
  const redirectUrl = 'https://helvetiforma.ch/reset-password'
  console.log('URL de redirection:', redirectUrl)
  console.log('')
  
  try {
    console.log('📧 Tentative d\'envoi d\'email de test...')
    
    const { data, error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
      redirectTo: redirectUrl,
    })
    
    if (error) {
      console.log('❌ Erreur:', error.message)
      console.log('Code d\'erreur:', error.status)
      console.log('')
      
      if (error.message.includes('redirectTo')) {
        console.log('🔍 Problème de redirection détecté!')
        console.log('Vérifiez que https://helvetiforma.ch est dans les URLs autorisées de Supabase')
      }
    } else {
      console.log('✅ Email envoyé avec succès!')
      console.log('Data:', data)
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message)
  }
}

// Exécuter le test
testEmailSending()
