'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@sanity/client'

interface User {
  _id: string
  email: string
  name?: string
  first_name?: string
  last_name?: string
  _createdAt: string
  _updatedAt: string
}

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

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

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
      
      // Charger les utilisateurs
      const usersData = await sanityClient.fetch(`
        *[_type == "user"] | order(_createdAt desc) {
          _id,
          email,
          name,
          first_name,
          last_name,
          _createdAt,
          _updatedAt
        }
      `)
      
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
      
      setUsers(usersData)
      setPurchases(purchasesData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'with-purchases') {
      const hasPurchases = purchases.some(p => p.userId === user._id)
      return matchesSearch && hasPurchases
    }
    
    return matchesSearch
  })

  const getUserPurchases = (userId: string) => {
    return purchases.filter(p => p.userId === userId)
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    try {
      setDeletingUser(userId)
      
      // Supprimer d'abord les achats de l'utilisateur
      const userPurchases = getUserPurchases(userId)
      for (const purchase of userPurchases) {
        await sanityClient.delete(purchase._id)
      }
      
      // Puis supprimer l'utilisateur
      await sanityClient.delete(userId)
      
      // Recharger les données
      await loadData()
      
      alert('Utilisateur supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    } finally {
      setDeletingUser(null)
    }
  }

  const getTotalRevenue = () => {
    return purchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const getStats = () => {
    const totalUsers = users.length
    const usersWithPurchases = users.filter(user => 
      purchases.some(p => p.userId === user._id)
    ).length
    const totalRevenue = getTotalRevenue()
    const totalPurchases = purchases.length

    return { totalUsers, usersWithPurchases, totalRevenue, totalPurchases }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les utilisateurs de votre plateforme et consultez leurs achats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total utilisateurs', value: stats.totalUsers, icon: '👥', color: 'text-blue-600' },
          { title: 'Utilisateurs actifs', value: stats.usersWithPurchases, icon: '💳', color: 'text-green-600' },
          { title: 'Total achats', value: stats.totalPurchases, icon: '🛒', color: 'text-purple-600' },
          { title: 'Chiffre d\'affaires', value: `${stats.totalRevenue} CHF`, icon: '💰', color: 'text-orange-600' },
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Rechercher un utilisateur
            </label>
            <input
              type="text"
              placeholder="Email, nom, prénom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:w-64">
            <label className="block text-sm font-medium text-foreground mb-2">
              Filtrer par statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="with-purchases">Avec achats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Liste des utilisateurs ({filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Achats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user, index) => {
                const userPurchases = getUserPurchases(user._id)
                const totalSpent = userPurchases
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + p.amount, 0)
                
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {(user.first_name?.[0] || user.name?.[0] || user.email[0]).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sans nom'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Nom complet non défini'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {userPurchases.length} achat{userPurchases.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {totalSpent > 0 ? `${totalSpent} CHF` : 'Aucun achat'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {new Date(user._createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          Voir les détails
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={deletingUser === user._id}
                          className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        >
                          {deletingUser === user._id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Détails de {selectedUser.email}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Informations personnelles</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nom complet:</span>
                    <div className="text-foreground">
                      {selectedUser.name || `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Non défini'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div className="text-foreground">{selectedUser.email}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inscrit le:</span>
                    <div className="text-foreground">
                      {new Date(selectedUser._createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dernière modification:</span>
                    <div className="text-foreground">
                      {new Date(selectedUser._updatedAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchases */}
              <div>
                <h4 className="font-medium text-foreground mb-3">
                  Historique des achats ({getUserPurchases(selectedUser._id).length})
                </h4>
                {getUserPurchases(selectedUser._id).length > 0 ? (
                  <div className="space-y-3">
                    {getUserPurchases(selectedUser._id).map((purchase) => (
                      <div key={purchase._id} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-foreground">{purchase.postTitle}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(purchase._createdAt).toLocaleString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              {purchase.amount} {purchase.currency.toUpperCase()}
                            </div>
                            <div className={`text-sm ${
                              purchase.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {purchase.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-8">
                    Aucun achat effectué
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
