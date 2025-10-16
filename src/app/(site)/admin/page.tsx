'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'

interface DashboardStats {
  users: number
  purchases: number
  revenue: number
  articles: number
  lastUpdate: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    purchases: 0,
    revenue: 0,
    articles: 0,
    lastUpdate: '',
  })

  // Configuration Sanity
  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xzzyyelh',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    token: 'skXgzGEbD5K6lnUI1tltLBqjTHvUakrCiqKQ37zJ2PToinKyf9tI2ZXYK7eebnstQSfKuUMm0c7RYTR1Xkn6RVzSP8z7pfDlDk5b6cyABqcsUFLgFSjAQXjRHD4b85DbhOEetOF53mXLmPtH5btF69AXkDXKSYuw34e6NikU9JSMBPAIdqBI',
    useCdn: false,
    apiVersion: '2023-05-03'
  })

  useEffect(() => {
    // Les statistiques sont maintenant gérées via WordPress/WooCommerce
    setStats({
      users: 0, // Géré via WordPress
      purchases: 0, // Géré via WooCommerce
      revenue: 0, // Géré via WooCommerce
      articles: 0, // Géré via WordPress
      lastUpdate: new Date().toLocaleDateString('fr-CH'),
    })
  }, [])

  const quickActions = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Voir et gérer les utilisateurs',
      href: '/admin/users',
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Achats et paiements',
      description: 'Consulter les achats et revenus',
      href: '/admin/purchases',
      icon: '💳',
      color: 'bg-green-500',
    },
    {
      title: 'Sanity Studio',
      description: 'Gérer le contenu avec Sanity',
      href: '/admin/sanity',
      icon: '📄',
      color: 'bg-purple-500',
    },
    {
      title: 'Paramètres',
      description: 'Configurer l\'application',
      href: '/admin/settings',
      icon: '⚙️',
      color: 'bg-orange-500',
    },
  ]

  const recentActivity = [
    { action: 'Page "Accueil" modifiée dans Sanity', time: '2 min ago', type: 'edit' },
    { action: 'Webinaire Teams créé', time: '1h ago', type: 'create' },
    { action: 'Cours WordPress synchronisé', time: '3h ago', type: 'sync' },
    { action: 'Configuration mise à jour', time: '1 jour ago', type: 'edit' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre contenu HelvetiForma facilement et efficacement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Utilisateurs', value: 'WordPress', icon: '👥', color: 'text-blue-600' },
          { title: 'Achats', value: 'WooCommerce', icon: '💳', color: 'text-green-600' },
          { title: 'Chiffre d\'affaires', value: 'WooCommerce', icon: '💰', color: 'text-purple-600' },
          { title: 'Articles', value: 'WordPress', icon: '📝', color: 'text-orange-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-background rounded-xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`text-3xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className="block bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-background rounded-xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">Activité récente</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'create' ? 'bg-green-500' :
                  activity.type === 'edit' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-background rounded-xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">État du système</h3>
          <div className="space-y-3">
            {[
              { service: 'Site web', status: 'online', response: '45ms' },
              { service: 'Sanity CMS', status: 'online', response: '89ms' },
              { service: 'WordPress API', status: 'online', response: '120ms' },
              { service: 'Microsoft Teams', status: 'online', response: '67ms' },
            ].map((service, index) => (
              <div key={service.service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-foreground">{service.service}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {service.response}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dernière sauvegarde</span>
              <span className="text-foreground font-medium">Il y a 5 min</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
