'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardStats {
  pages: number
  formations: number
  images: number
  lastUpdate: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pages: 0,
    formations: 0,
    images: 0,
    lastUpdate: '',
  })

  useEffect(() => {
    // Simuler le chargement des statistiques
    const loadStats = async () => {
      // En production, ceci sera remplacé par de vrais appels API
      setStats({
        pages: 5,
        formations: 12,
        images: 28,
        lastUpdate: new Date().toLocaleDateString('fr-CH'),
      })
    }
    
    loadStats()
  }, [])

  const quickActions = [
    {
      title: 'Nouvelle page',
      description: 'Créer une nouvelle page de contenu',
      href: '/admin/content/pages/new',
      icon: '📄',
      color: 'bg-blue-500',
    },
    {
      title: 'Nouvelle formation',
      description: 'Ajouter une formation au catalogue',
      href: '/admin/content/formations/new',
      icon: '🎓',
      color: 'bg-green-500',
    },
    {
      title: 'Upload média',
      description: 'Ajouter des images ou documents',
      href: '/admin/media/upload',
      icon: '📤',
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
    { action: 'Page "Accueil" modifiée', time: '2 min ago', type: 'edit' },
    { action: 'Formation "Comptabilité" créée', time: '1h ago', type: 'create' },
    { action: 'Image "hero-bg.jpg" uploadée', time: '3h ago', type: 'upload' },
    { action: 'Navigation mise à jour', time: '1 jour ago', type: 'edit' },
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
          { title: 'Pages', value: stats.pages, icon: '📄', color: 'text-blue-600' },
          { title: 'Formations', value: stats.formations, icon: '🎓', color: 'text-green-600' },
          { title: 'Images', value: stats.images, icon: '🖼️', color: 'text-purple-600' },
          { title: 'Dernière MAJ', value: stats.lastUpdate, icon: '🕒', color: 'text-orange-600' },
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
              { service: 'WordPress API', status: 'online', response: '120ms' },
              { service: 'Microsoft Teams', status: 'online', response: '89ms' },
              { service: 'Supabase', status: 'online', response: '67ms' },
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
