const { createClient } = require('@sanity/client')

async function generateToken() {
  console.log('🔑 Génération du token Sanity...\n')

  try {
    // Créer un client temporaire pour générer le token
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: '2024-01-01',
    })

    // Note: En production, vous devriez créer un token via le dashboard Sanity
    // ou utiliser une variable d'environnement existante
    console.log('⚠️  Pour générer un token Sanity:');
    console.log('1. Allez sur https://www.sanity.io/manage');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans "API" > "Tokens"');
    console.log('4. Créez un nouveau token avec les permissions "Editor" ou "Admin"');
    console.log('5. Ajoutez-le à vos variables d\'environnement:');
    console.log('   SANITY_API_TOKEN=your_token_here');
    
    console.log('\n📋 Variables d\'environnement actuelles:');
    console.log(`NEXT_PUBLIC_SANITY_PROJECT_ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'Non défini'}`);
    console.log(`NEXT_PUBLIC_SANITY_DATASET: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'Non défini'}`);
    console.log(`SANITY_API_TOKEN: ${process.env.SANITY_API_TOKEN ? 'Défini' : 'Non défini'}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

generateToken();
