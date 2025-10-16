'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Play, Award, Calendar, Filter, Search } from 'lucide-react';
import { UnifiedContent, getUserPurchasedContent } from '@/lib/unified-payment';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedContentCard from '@/components/UnifiedContentCard';
import Link from 'next/link';

export default function UnifiedDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<UnifiedContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<UnifiedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'articles' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'progress'>('newest');

  useEffect(() => {
    const loadUserContent = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userContent = await getUserPurchasedContent(user.id);
        setContent(userContent);
        setFilteredContent(userContent);
      } catch (error) {
        console.error('Error loading user content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserContent();
  }, [user?.id]);

  // Filter and search content
  useEffect(() => {
    let filtered = [...content];

    // Tab filter
    switch (activeTab) {
      case 'courses':
        filtered = filtered.filter(item => item.type === 'course');
        break;
      case 'articles':
        filtered = filtered.filter(item => item.type === 'article');
        break;
      case 'in-progress':
        filtered = filtered.filter(item => 
          item.type === 'course' && 
          item.isEnrolled && 
          !item.isCompleted && 
          (item.progressPercentage || 0) > 0
        );
        break;
      case 'completed':
        filtered = filtered.filter(item => 
          (item.type === 'course' && item.isCompleted) ||
          (item.type === 'article' && item.isPurchased)
        );
        break;
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort content
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'oldest':
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return (b.progressPercentage || 0) - (a.progressPercentage || 0);
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  }, [content, activeTab, searchQuery, sortBy]);

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'all':
        return content.length;
      case 'courses':
        return content.filter(item => item.type === 'course').length;
      case 'articles':
        return content.filter(item => item.type === 'article').length;
      case 'in-progress':
        return content.filter(item => 
          item.type === 'course' && 
          item.isEnrolled && 
          !item.isCompleted && 
          (item.progressPercentage || 0) > 0
        ).length;
      case 'completed':
        return content.filter(item => 
          (item.type === 'course' && item.isCompleted) ||
          (item.type === 'article' && item.isPurchased)
        ).length;
      default:
        return 0;
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Chargement...
            </h1>
            <p className="text-gray-600">
              Vérification de votre authentification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mon Contenu
            </h1>
            <p className="text-lg text-gray-600">
              Gérez vos formations et articles achetés
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans votre contenu..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="title">Titre</option>
                <option value="progress">Progression</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', label: 'Tout mon contenu', icon: BookOpen },
                { id: 'courses', label: 'Formations', icon: Play },
                { id: 'articles', label: 'Articles', icon: BookOpen },
                { id: 'in-progress', label: 'En cours', icon: Clock },
                { id: 'completed', label: 'Terminés', icon: CheckCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const count = getTabCount(tab.id);
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' && 'Aucun contenu trouvé'}
              {activeTab === 'courses' && 'Aucune formation inscrite'}
              {activeTab === 'articles' && 'Aucun article acheté'}
              {activeTab === 'in-progress' && 'Aucun contenu en cours'}
              {activeTab === 'completed' && 'Aucun contenu terminé'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' && 'Commencez par explorer notre catalogue de formations et articles'}
              {activeTab === 'courses' && 'Inscrivez-vous à des formations pour les voir ici'}
              {activeTab === 'articles' && 'Achetez des articles pour les voir ici'}
              {activeTab === 'in-progress' && 'Continuez vos formations et articles pour voir votre progression'}
              {activeTab === 'completed' && 'Terminez vos formations et articles pour les voir ici'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Voir les formations
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Voir les articles
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredContent.map((item, index) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <UnifiedContentCard 
                  content={item} 
                  hasPurchased={item.type === 'article' ? true : item.isEnrolled || false}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
