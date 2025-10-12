'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@sanity/client'

interface Purchase {
  _id: string
  userId: string
  postTitle: string
  postId: string
  amount: number
  currency: string
  status: string
  stripeSessionId?: string
  _createdAt: string
}

interface User {
  _id: string
  email: string
  name?: string
  first_name?: string
  last_name?: string
}

export default function PurchasesManagement() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [deletingPurchase, setDeletingPurchase] = useState<string | null>(null)

  // Configuration Sanity
  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xzzyyelh',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    token: 'skXgzGEbD5K6lnUI1tltLBqjTHvUakrCiqKQ37zJ2PToinKyf9tI2ZXYK7eebnstQSfKuUMm0c7RYTR1Xkn6RVzSP8z7pfDlDk5b6cyABqcsUFLgFSjAQXjRHD4b85DbhOEetOF53mXLmPtH5btF69AXkDXKSYuw34e6NikU9JSMBPAIdqBI',
    useCdn: false,
    apiVersion: '2023-05-03'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les achats
      const purchasesData = await sanityClient.fetch(`
        *[_type == "purchase"] | order(_createdAt desc) {
          _id,
          userId,
          postTitle,
          postId,
          amount,
          currency,
          status,
          stripeSessionId,
          _createdAt
        }
      `)
      
      // Charger les utilisateurs
      const usersData = await sanityClient.fetch(`
        *[_type == "user"] {
          _id,
          email,
          name,
          first_name,
          last_name
        }
      `)
      
      setPurchases(purchasesData)
      setUsers(usersData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserByEmail = (userId: string) => {
    return users.find(user => user._id === userId)
  }

  const deletePurchase = async (purchaseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat ? Cette action est irréversible.')) {
      return
    }

    try {
      setDeletingPurchase(purchaseId)
      
      await sanityClient.delete(purchaseId)
      
      // Recharger les données
      await loadData()
      
      alert('Achat supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'achat')
    } finally {
      setDeletingPurchase(null)
    }
  }

  const filteredPurchases = purchases.filter(purchase => {
    const user = getUserByEmail(purchase.userId)
    const matchesSearch = purchase.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user?.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus
    
    const matchesPeriod = (() => {
      if (filterPeriod === 'all') return true
      const purchaseDate = new Date(purchase._createdAt)
      const now = new Date()
      
      switch (filterPeriod) {
        case 'today':
          return purchaseDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return purchaseDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return purchaseDate >= monthAgo
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesPeriod
  })

  const getStats = () => {
    const totalPurchases = purchases.length
    const completedPurchases = purchases.filter(p => p.status === 'completed').length
    const totalRevenue = purchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
    const averageOrderValue = completedPurchases > 0 ? totalRevenue / completedPurchases : 0

    return { totalPurchases, completedPurchases, totalRevenue, averageOrderValue }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des achats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des achats</h1>
        <p className="text-muted-foreground mt-2">
          Consultez et gérez tous les achats effectués sur votre plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total achats', value: stats.totalPurchases, icon: '🛒', color: 'text-blue-600' },
          { title: 'Achats validés', value: stats.completedPurchases, icon: '✅', color: 'text-green-600' },
          { title: 'Chiffre d\'affaires', value: `${stats.totalRevenue} CHF`, icon: '💰', color: 'text-purple-600' },
          { title: 'Panier moyen', value: `${stats.averageOrderValue.toFixed(0)} CHF`, icon: '📊', color: 'text-orange-600' },
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

      {/* Filters */}
      <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Article, utilisateur, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Validé</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Période
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Liste des achats ({filteredPurchases.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Session Stripe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPurchases.map((purchase, index) => {
                const user = getUserByEmail(purchase.userId)
                
                return (
                  <motion.tr
                    key={purchase._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {purchase.postTitle}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {purchase.postId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {user?.email || purchase.userId}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Utilisateur inconnu'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {purchase.amount} {purchase.currency.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        purchase.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : purchase.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {new Date(purchase._createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(purchase._createdAt).toLocaleTimeString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground font-mono">
                        {purchase.stripeSessionId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deletePurchase(purchase._id)}
                        disabled={deletingPurchase === purchase._id}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        {deletingPurchase === purchase._id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const csvContent = [
              ['Article', 'Utilisateur', 'Email', 'Montant', 'Statut', 'Date', 'Session Stripe'],
              ...filteredPurchases.map(p => {
                const user = getUserByEmail(p.userId)
                return [
                  p.postTitle,
                  user?.name || 'Inconnu',
                  user?.email || p.userId,
                  `${p.amount} ${p.currency}`,
                  p.status,
                  new Date(p._createdAt).toLocaleString('fr-FR'),
                  p.stripeSessionId || 'N/A'
                ]
              })
            ].map(row => row.join(',')).join('\n')
            
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `achats-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            window.URL.revokeObjectURL(url)
          }}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          📊 Exporter en CSV
        </button>
      </div>
    </div>
  )
}
