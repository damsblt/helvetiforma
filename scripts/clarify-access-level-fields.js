const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function clarifyAccessLevelFields() {
  console.log('🔍 Clarification des champs access_level...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Vérifier les champs ACF disponibles
    console.log('1️⃣ Vérification des champs ACF...\n');
    
    try {
      const acfResponse = await wpApi.get('/wp-json/acf/v3/field-groups');
      const fieldGroups = acfResponse.data;
      
      console.log(`✅ ${fieldGroups.length} groupes de champs ACF trouvés`);
      
      fieldGroups.forEach(group => {
        console.log(`   - ${group.title} (ID: ${group.id})`);
        if (group.fields) {
          group.fields.forEach(field => {
            if (field.name && (field.name.includes('access') || field.name.includes('niveau'))) {
              console.log(`     * ${field.name}: ${field.label} (${field.type})`);
            }
          });
        }
      });
      
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux champs ACF via API');
    }

    // 2. Créer un article de test pour vérifier les champs
    console.log('\n2️⃣ Création d\'un article de test...\n');
    
    const testPost = {
      title: 'Test Champs Access Level - ' + new Date().toISOString(),
      content: 'Article de test pour vérifier les champs access_level',
      status: 'draft'
    };

    const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
    const postId = postResponse.data.id;
    console.log(`✅ Article de test créé (ID: ${postId})`);

    // 3. Instructions pour la configuration correcte
    console.log('\n3️⃣ Instructions pour la configuration correcte...\n');
    
    console.log('🎯 BONNE DÉMARCHE POUR CONFIGURER UN ARTICLE PREMIUM :\n');
    
    console.log('1. DANS L\'ÉDITEUR D\'ARTICLE :');
    console.log('   - Ouvrez l\'article en mode édition');
    console.log('   - Cherchez la boîte "Paramètres Premium" (à droite)');
    console.log('   - Cette boîte est ajoutée par notre plugin');
    console.log('');
    
    console.log('2. CONFIGUREZ LES CHAMPS DU PLUGIN :');
    console.log('   - Niveau d\'accès : Sélectionnez "Premium"');
    console.log('   - Prix (CHF) : Entrez le prix (ex: 25.00)');
    console.log('   - Ces champs créent les métadonnées : access_level et price');
    console.log('');
    
    console.log('3. IGNOREZ LES CHAMPS ACF :');
    console.log('   - Ne touchez PAS aux champs ACF "Article Metadata"');
    console.log('   - Ne touchez PAS au champ "niveau d\'accès" d\'ACF');
    console.log('   - Utilisez UNIQUEMENT les champs du plugin "Paramètres Premium"');
    console.log('');
    
    console.log('4. SAUVEGARDEZ L\'ARTICLE :');
    console.log('   - Cliquez sur "Mettre à jour"');
    console.log('   - Le plugin détectera automatiquement les changements');
    console.log('   - Un produit WooCommerce sera créé automatiquement');
    console.log('');

    // 4. Vérifier les métadonnées de l'article de test
    console.log('4️⃣ Vérification des métadonnées...\n');
    
    try {
      // Essayer d'accéder aux métadonnées via l'API REST
      const metaResponse = await wpApi.get(`/wp-json/wp/v2/posts/${postId}/meta`);
      const metadata = metaResponse.data;
      
      console.log(`✅ ${metadata.length} métadonnées trouvées pour l'article ${postId}`);
      
      metadata.forEach(meta => {
        console.log(`   - ${meta.meta_key}: ${meta.meta_value}`);
      });
      
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux métadonnées via API');
      console.log('   C\'est normal, l\'API REST ne peut pas accéder aux métadonnées');
    }

    // 5. Test de configuration manuelle
    console.log('\n5️⃣ Test de configuration manuelle...\n');
    
    console.log('🧪 TEST MANUEL :\n');
    
    console.log('1. Allez dans l\'admin WordPress :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin`);
    console.log('');
    
    console.log('2. Trouvez l\'article de test :');
    console.log(`   Titre: "${testPost.title}"`);
    console.log(`   ID: ${postId}`);
    console.log('');
    
    console.log('3. Ouvrez l\'article en mode édition');
    console.log('');
    
    console.log('4. Cherchez la boîte "Paramètres Premium" (à droite) :');
    console.log('   - Si elle n\'apparaît pas, le plugin n\'est pas activé');
    console.log('   - Si elle apparaît, configurez les champs');
    console.log('');
    
    console.log('5. Configurez les paramètres premium :');
    console.log('   - Niveau d\'accès : Premium');
    console.log('   - Prix : 50.00 CHF');
    console.log('');
    
    console.log('6. Sauvegardez l\'article');
    console.log('');
    
    console.log('7. Vérifiez dans WooCommerce → Produits');
    console.log('   - Un produit devrait être créé automatiquement');
    console.log('');

    // 6. Différence entre ACF et Plugin
    console.log('6️⃣ Différence entre ACF et Plugin...\n');
    
    console.log('🔍 CHAMPS ACF vs CHAMPS PLUGIN :\n');
    
    console.log('❌ NE PAS UTILISER (ACF) :');
    console.log('   - "Article Metadata" → "niveau d\'accès"');
    console.log('   - Ces champs sont pour l\'affichage seulement');
    console.log('   - Ils ne déclenchent pas l\'automatisation');
    console.log('');
    
    console.log('✅ UTILISER (Plugin) :');
    console.log('   - "Paramètres Premium" → "Niveau d\'accès"');
    console.log('   - "Paramètres Premium" → "Prix (CHF)"');
    console.log('   - Ces champs déclenchent l\'automatisation');
    console.log('   - Ils créent les métadonnées access_level et price');
    console.log('');

    // 7. Nettoyage
    console.log('7️⃣ Nettoyage...\n');
    
    try {
      await wpApi.delete(`/wp-json/wp/v2/posts/${postId}?force=true`);
      console.log('✅ Article de test supprimé');
    } catch (error) {
      console.log('⚠️ Impossible de supprimer l\'article de test');
    }

    console.log('\n🎯 RÉSUMÉ :');
    console.log('   Utilisez UNIQUEMENT les champs "Paramètres Premium" du plugin');
    console.log('   Ignorez les champs ACF "Article Metadata"');
    console.log('   Le plugin créera automatiquement le produit WooCommerce');

  } catch (error) {
    console.error('❌ Erreur lors de la clarification:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter la clarification
clarifyAccessLevelFields();
