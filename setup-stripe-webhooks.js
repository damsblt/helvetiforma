const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupWebhooks() {
  console.log('🔧 Configuration des webhooks Stripe...\n');

  try {
    // URL de votre webhook (remplacez par votre domaine de production)
    const webhookUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`
      : 'https://your-domain.vercel.app/api/payment/webhook';

    console.log(`📍 URL du webhook: ${webhookUrl}`);

    // Créer le webhook endpoint
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled'
      ],
      description: 'HelvetiForma Payment Webhook'
    });

    console.log('✅ Webhook créé avec succès!');
    console.log(`🆔 Webhook ID: ${webhook.id}`);
    console.log(`🔑 Secret: ${webhook.secret}`);
    
    console.log('\n📋 Variables d\'environnement à ajouter:');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    
    console.log('\n⚠️  Important:');
    console.log('1. Ajoutez STRIPE_WEBHOOK_SECRET à vos variables d\'environnement');
    console.log('2. Testez le webhook avec Stripe CLI: stripe listen --forward-to localhost:3000/api/payment/webhook');
    console.log('3. En production, remplacez l\'URL par votre domaine réel');

  } catch (error) {
    console.error('❌ Erreur lors de la création du webhook:', error.message);
  }
}

setupWebhooks();
