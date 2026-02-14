/**
 * Script de test pour le formulaire de contact
 * Teste l'API /api/contact avec le nouvel email info@helvetiforma.ch
 */

const testContactForm = async () => {
  const testData = {
    name: 'Test Utilisateur',
    email: 'test@example.com',
    phone: '+41 79 123 45 67',
    company: 'Test Company',
    subject: 'Test de formulaire de contact',
    message: 'Ceci est un message de test pour vérifier que le formulaire fonctionne correctement avec le nouvel email info@helvetiforma.ch',
    interest: 'autre'
  }

  try {
    console.log('🧪 Test du formulaire de contact...\n')
    console.log('Données de test:', JSON.stringify(testData, null, 2))
    console.log('\n📧 Vérification de l\'email destinataire: info@helvetiforma.ch\n')

    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Succès! Le formulaire a été soumis correctement.')
      console.log('📨 Réponse:', result)
      console.log('\n⚠️  Note: L\'email sera envoyé à info@helvetiforma.ch')
      console.log('   Vérifiez votre boîte de réception pour confirmer la réception.')
    } else {
      console.error('❌ Erreur lors de l\'envoi du formulaire:')
      console.error('   Status:', response.status)
      console.error('   Erreur:', result.error)
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.error('\n💡 Assurez-vous que:')
    console.error('   1. Le serveur de développement est démarré (npm run dev)')
    console.error('   2. Les variables d\'environnement sont configurées (.env.local)')
    console.error('   3. La configuration SMTP est correcte')
  }
}

// Exécuter le test
testContactForm()

