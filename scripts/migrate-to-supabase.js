#!/usr/bin/env node

/**
 * Script de Migration : Sanity → Supabase
 * 
 * Ce script migre les données utilisateurs et achats de Sanity vers Supabase
 * pour assurer la conformité RGPD et réduire les coûts.
 */

import { createClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from '@sanity/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configuration Sanity
const sanityClient = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function migrateUsers() {
  console.log('🔄 Migration des utilisateurs...')
  
  try {
    // Récupérer tous les utilisateurs de Sanity
    const users = await sanityClient.fetch(`*[_type == "user"]`)
    console.log(`📊 ${users.length} utilisateurs trouvés dans Sanity`)
    
    let migrated = 0
    let errors = 0
    
    for (const user of users) {
      try {
        // Hasher le mot de passe (si pas déjà hashé)
        const hashedPassword = await bcrypt.hash(user.password, 12)
        
        // Insérer dans Supabase
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            email: user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            password_hash: hashedPassword,
            created_at: user.createdAt || new Date().toISOString()
          })
        
        if (error) {
          console.error(`❌ Erreur migration utilisateur ${user.email}:`, error.message)
          errors++
        } else {
          console.log(`✅ Utilisateur migré: ${user.email}`)
          migrated++
        }
      } catch (err) {
        console.error(`❌ Erreur traitement utilisateur ${user.email}:`, err.message)
        errors++
      }
    }
    
    console.log(`\n📈 Résultat migration utilisateurs:`)
    console.log(`   ✅ Migrés: ${migrated}`)
    console.log(`   ❌ Erreurs: ${errors}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration des utilisateurs:', error)
  }
}

async function migratePurchases() {
  console.log('\n🔄 Migration des achats...')
  
  try {
    // Récupérer tous les achats de Sanity
    const purchases = await sanityClient.fetch(`*[_type == "purchase"]`)
    console.log(`📊 ${purchases.length} achats trouvés dans Sanity`)
    
    let migrated = 0
    let errors = 0
    
    for (const purchase of purchases) {
      try {
        // Trouver l'ID utilisateur correspondant dans Supabase
        const { data: user } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', purchase.userId) // Assumant que userId est l'email
          .single()
        
        if (!user) {
          console.warn(`⚠️ Utilisateur non trouvé pour l'achat ${purchase._id}`)
          errors++
          continue
        }
        
        // Insérer l'achat dans Supabase
        const { data, error } = await supabase
          .from('purchases')
          .insert({
            user_id: user.id,
            post_id: purchase.postId,
            post_title: purchase.postTitle,
            amount: purchase.amount,
            currency: 'chf',
            stripe_session_id: purchase.stripeSessionId,
            stripe_payment_intent_id: purchase.stripePaymentIntentId,
            status: purchase.status || 'completed',
            purchased_at: purchase.purchasedAt || new Date().toISOString()
          })
        
        if (error) {
          console.error(`❌ Erreur migration achat ${purchase._id}:`, error.message)
          errors++
        } else {
          console.log(`✅ Achat migré: ${purchase.postTitle}`)
          migrated++
        }
      } catch (err) {
        console.error(`❌ Erreur traitement achat ${purchase._id}:`, err.message)
        errors++
      }
    }
    
    console.log(`\n📈 Résultat migration achats:`)
    console.log(`   ✅ Migrés: ${migrated}`)
    console.log(`   ❌ Erreurs: ${errors}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration des achats:', error)
  }
}

async function verifyMigration() {
  console.log('\n🔍 Vérification de la migration...')
  
  try {
    // Compter les utilisateurs dans Supabase
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Compter les achats dans Supabase
    const { count: purchaseCount } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Données dans Supabase:`)
    console.log(`   👥 Utilisateurs: ${userCount}`)
    console.log(`   💳 Achats: ${purchaseCount}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  }
}

async function main() {
  console.log('🚀 Début de la migration Sanity → Supabase')
  console.log('==========================================\n')
  
  // Vérifier les variables d'environnement
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Variables d\'environnement Supabase manquantes')
    process.exit(1)
  }
  
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('❌ Variables d\'environnement Sanity manquantes')
    process.exit(1)
  }
  
  try {
    // 1. Migration des utilisateurs
    await migrateUsers()
    
    // 2. Migration des achats
    await migratePurchases()
    
    // 3. Vérification
    await verifyMigration()
    
    console.log('\n🎉 Migration terminée avec succès!')
    console.log('\n📋 Prochaines étapes:')
    console.log('   1. Tester l\'authentification avec Supabase')
    console.log('   2. Mettre à jour NextAuth configuration')
    console.log('   3. Déployer en production')
    console.log('   4. Supprimer les données utilisateurs de Sanity')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
