const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'damien.balet@me.com';
const WORDPRESS_PASSWORD = 'EchU Msw4 5veB hETM aJvb Omcw';

async function grantAdminPermissions() {
  console.log('🔧 Attribution des permissions administrateur à:', WORDPRESS_USER);
  
  try {
    const auth = Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64');
    
    // 1. Vérifier l'utilisateur actuel
    console.log('\n1️⃣ Vérification de l\'utilisateur actuel...');
    const meResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    const userId = meResponse.data.id;
    console.log('✅ Utilisateur ID:', userId);
    console.log('👤 Nom:', meResponse.data.name);
    
    // 2. Mettre à jour l'utilisateur avec le rôle administrateur
    console.log('\n2️⃣ Attribution du rôle administrateur...');
    const updateResponse = await axios.put(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
      roles: ['administrator']
    }, {
      headers: { 
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Rôle administrateur attribué !');
    console.log('🔑 Nouveaux rôles:', updateResponse.data.roles);
    
    // 3. Vérifier les nouvelles permissions
    console.log('\n3️⃣ Vérification des nouvelles permissions...');
    const verifyResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    console.log('✅ Vérification réussie');
    console.log('🔑 Rôles confirmés:', verifyResponse.data.roles);
    
    // 4. Tester l'API REST qui posait problème
    console.log('\n4️⃣ Test de l\'API REST...');
    const typesResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/types/post?context=edit`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    console.log('✅ API REST accessible !');
    console.log('📋 Type de post:', typesResponse.data.name);
    
    // 5. Tester l'accès aux posts
    console.log('\n5️⃣ Test d\'accès aux posts...');
    const postsResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=5`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    console.log('✅ Accès aux posts OK -', postsResponse.data.length, 'posts trouvés');
    
    console.log('\n🎉 SUCCÈS ! L\'utilisateur a maintenant toutes les permissions administrateur');
    console.log('✅ L\'erreur 403 Forbidden devrait être résolue');
    console.log('✅ La liste d\'articles devrait maintenant s\'afficher correctement');
    
  } catch (error) {
    console.log('❌ Erreur lors de l\'attribution des permissions:', error.response?.status);
    if (error.response?.data) {
      console.log('📄 Message:', error.response.data.message);
      console.log('📄 Code:', error.response.data.code);
    }
    
    // Si l'erreur est 403, essayer une approche alternative
    if (error.response?.status === 403) {
      console.log('\n⚠️ Erreur 403 - L\'utilisateur n\'a pas les permissions pour se modifier lui-même');
      console.log('💡 Solution: Connectez-vous avec un autre compte administrateur pour modifier cet utilisateur');
    }
  }
}

// Exécuter le script
grantAdminPermissions();
