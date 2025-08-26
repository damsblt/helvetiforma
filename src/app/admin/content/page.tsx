'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTypeOptions, getThemeOptions } from '../../../utils/strapiFields';

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type: string;
  Theme: string;
  summary: any;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContentPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    Title: '',
    Description: '',
    Type: '',
    Theme: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    Title: '',
    Description: '',
    Type: '',
    Theme: ''
  });

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const res = await fetch('http://localhost:1337/api/formations?populate=*&sort=createdAt:DESC');
      
      if (res.ok) {
        const data = await res.json();
        setFormations(data.data || []);
      } else {
        console.error('Failed to fetch formations:', res.status);
      }
    } catch (error) {
      console.error('Error fetching formations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.Description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || formation.Type === filterType;
    return matchesSearch && matchesType;
  });

  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation);
    setEditForm({
      Title: formation.Title,
      Description: formation.Description,
      Type: formation.Type,
      Theme: formation.Theme
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedFormation) return;

    try {
      const res = await fetch(`http://localhost:1337/api/formations/${selectedFormation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: editForm
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Formation updated successfully:', result);
        alert('Formation mise à jour avec succès!');
        setShowEditModal(false);
        setSelectedFormation(null);
        fetchFormations(); // Refresh the list
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Server error:', res.status, errorData);
        alert(`Erreur lors de la mise à jour (${res.status}): ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error updating formation:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:1337/api/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: createForm
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Formation created successfully:', result);
        alert('Formation créée avec succès!');
        setShowCreateModal(false);
        setCreateForm({
          Title: '',
          Description: '',
          Type: '',
          Theme: ''
        });
        fetchFormations(); // Refresh the list
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Server error:', res.status, errorData);
        alert(`Erreur lors de la création (${res.status}): ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error creating formation:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Présentiel': 'bg-green-100 text-green-800',
      'En ligne': 'bg-blue-100 text-blue-800'
    };
    const colorClass = colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{type}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h1>
            <p className="text-gray-600">Récupération des formations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Contenu</h1>
          <p className="text-gray-600">Gérez vos formations et documents</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-full lg:max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher une formation
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Titre ou description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                {getTypeOptions().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                + Nouvelle formation
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-xl lg:text-2xl">📚</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Total Formations</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{formations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-xl lg:text-2xl">👥</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Présentiel</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {formations.filter(f => f.Type === 'Présentiel').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-xl lg:text-2xl">💻</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">En ligne</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {formations.filter(f => f.Type === 'En ligne').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-purple-600 text-xl lg:text-2xl">📊</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Types</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {new Set(formations.map(f => f.Type)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">
              Formations ({filteredFormations.length})
            </h2>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden">
            {filteredFormations.map((formation) => (
              <div key={formation.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{formation.Title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{formation.Description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getTypeBadge(formation.Type)}
                        <span className="text-xs text-gray-500">{formation.Theme}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(formation)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                    >
                      Modifier
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Modifié le {formatDate(formation.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thème
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière modification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFormations.map((formation) => (
                  <tr key={formation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formation.Title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {formation.Description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(formation.Type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formation.Theme}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(formation.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(formation)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFormations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' ? 'Aucune formation trouvée' : 'Aucune formation créée'}
              </p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Créer une nouvelle formation
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({
                        Title: '',
                        Description: '',
                        Type: '',
                        Theme: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={createForm.Title}
                      onChange={(e) => setCreateForm({...createForm, Title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Formation Excel Avancé"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={createForm.Description}
                      onChange={(e) => setCreateForm({...createForm, Description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description détaillée de la formation..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={createForm.Type}
                        onChange={(e) => setCreateForm({...createForm, Type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un type</option>
                        {getTypeOptions().map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thème
                      </label>
                      <select
                        value={createForm.Theme}
                        onChange={(e) => setCreateForm({...createForm, Theme: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un thème</option>
                        {getThemeOptions().map(theme => (
                          <option key={theme} value={theme}>{theme}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({
                        Title: '',
                        Description: '',
                        Type: '',
                        Theme: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!createForm.Title || !createForm.Description || !createForm.Type}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Créer la formation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedFormation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Modifier la formation
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedFormation(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={editForm.Title}
                      onChange={(e) => setEditForm({...editForm, Title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.Description}
                      onChange={(e) => setEditForm({...editForm, Description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={editForm.Type}
                        onChange={(e) => setEditForm({...editForm, Type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un type</option>
                        {getTypeOptions().map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thème
                      </label>
                      <select
                        value={editForm.Theme}
                        onChange={(e) => setEditForm({...editForm, Theme: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un thème</option>
                        {getThemeOptions().map(theme => (
                          <option key={theme} value={theme}>{theme}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedFormation(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 