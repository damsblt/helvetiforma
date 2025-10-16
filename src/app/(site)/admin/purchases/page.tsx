'use client'

import { motion } from 'framer-motion'

export default function PurchasesManagement() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des achats</h1>
        <p className="text-muted-foreground mt-2">
          Les achats sont maintenant gérés via WooCommerce/WordPress
        </p>
      </div>

      {/* Migration Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">✅</span>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-green-900">
              Migration vers WooCommerce
            </h3>
            <p className="mt-2 text-green-700">
              La gestion des achats a été migrée vers WooCommerce. 
              Vous pouvez maintenant gérer les commandes, produits et paiements directement depuis l'interface WordPress.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href={`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin/edit.php?post_type=shop_order`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Voir les commandes
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin/edit.php?post_type=product`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir les produits
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Commandes',
            description: 'Gérer les commandes et leur statut',
            icon: '🛒',
            color: 'bg-blue-500'
          },
          {
            title: 'Produits',
            description: 'Créer et modifier les produits',
            icon: '📦',
            color: 'bg-green-500'
          },
          {
            title: 'Paiements',
            description: 'Suivre les paiements et remboursements',
            icon: '💳',
            color: 'bg-purple-500'
          },
          {
            title: 'Rapports',
            description: 'Consulter les rapports de vente',
            icon: '📊',
            color: 'bg-orange-500'
          },
          {
            title: 'Clients',
            description: 'Gérer les informations clients',
            icon: '👥',
            color: 'bg-indigo-500'
          },
          {
            title: 'Paramètres',
            description: 'Configurer WooCommerce',
            icon: '⚙️',
            color: 'bg-gray-500'
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-background rounded-xl p-6 shadow-sm border border-border"
          >
            <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}