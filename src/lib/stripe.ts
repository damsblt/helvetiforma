import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

// Configuration centralisée pour les environnements
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // URLs de base pour les redirections
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  // Mode de test ou production basé sur la clé
  isTestMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
}

export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

export const formatAmountForStripe = (amount: number): number => {
  // Convert CHF to cents (Stripe uses smallest currency unit)
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  // Convert cents back to CHF
  return amount / 100
}

// Fonctions utilitaires pour les URLs
export const getStripeSuccessUrl = (path: string): string => {
  return `${STRIPE_CONFIG.baseUrl}${path}?payment=success&session_id={CHECKOUT_SESSION_ID}`
}

export const getStripeCancelUrl = (path: string): string => {
  return `${STRIPE_CONFIG.baseUrl}${path}?payment=cancelled`
}

// Fonction pour obtenir l'URL du webhook selon l'environnement
export const getStripeWebhookUrl = (): string => {
  return `${STRIPE_CONFIG.baseUrl}/api/payment/webhook`
}
