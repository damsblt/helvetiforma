'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';
import Link from 'next/link';

interface Registration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  formation: {
    id: number;
    Title: string;
  };
  userAccount: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedRegistrations: Registration[] = data.data.map((reg: any) => ({
          id: reg.id,
          firstName: reg.user_first_name,
          lastName: reg.user_last_name,
          email: reg.user_email,
          status: reg.status,
          createdAt: reg.created_at,
          formation: { id: reg.formation_id, Title: `Formation ${reg.formation_id}` }, // We'll need to fetch formation details
          userAccount: { id: reg.id, email: reg.user_email, firstName: reg.user_first_name, lastName: reg.user_last_name }
        }));
        setRegistrations(transformedRegistrations);
      } else {
        console.error('Failed to fetch registrations');
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const approveRegistration = async (id: number) => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'confirmed' }),
      });

      if (response.ok) {
        alert('Registration approved successfully!');
        // Update the local state to show the change
        setRegistrations(prev => prev.map(reg => 
          reg.id === id 
            ? { ...reg, status: 'confirmed' }
            : reg
        ));
      } else {
        const error = await response.json();
        alert(`Error approving registration: ${error.error}`);
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration');
    }
  };

  const rejectRegistration = async (id: number) => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'rejected' }),
      });

      if (response.ok) {
        alert('Registration rejected successfully!');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedRegistration(null);
        // Update the local state to show the change
        setRegistrations(prev => prev.map(reg => 
          reg.id === id 
            ? { ...reg, status: 'rejected' }
            : reg
        ));
      } else {
        const error = await response.json();
        alert(`Error rejecting registration: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Error rejecting registration');
    }
  };

  const handleBulkAction = async () => {
    if (selectedRegistrations.length === 0) return;

    try {
      // For now, simulate bulk actions with sample data
      // In the future, you can create proper bulk action endpoints
      const newStatus = bulkAction === 'approve' ? 'confirmed' : 'rejected';
      
      // Update the local state to show the changes
      setRegistrations(prev => prev.map(reg => 
        selectedRegistrations.includes(reg.id)
          ? { ...reg, status: newStatus }
          : reg
      ));
      
      alert(`${bulkAction === 'approve' ? 'Approuvées' : 'Rejetées'} ${selectedRegistrations.length} inscription(s) avec succès! (Sample data)`);
      setShowBulkModal(false);
      setSelectedRegistrations([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Erreur lors de l\'action en masse');
    }
  };

  const toggleRegistrationSelection = (id: number) => {
    setSelectedRegistrations(prev => 
      prev.includes(id) 
        ? prev.filter(regId => regId !== id)
        : [...prev, id]
    );
  };

  const selectAllPending = () => {
    const pendingIds = registrations
      .filter(reg => reg.status === 'pending')
      .map(reg => reg.id);
    setSelectedRegistrations(pendingIds);
  };

  const clearSelection = () => {
    setSelectedRegistrations([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmée</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Annulée</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h1>
            <p className="text-gray-600">Récupération des inscriptions</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Inscriptions</h1>
              <p className="text-gray-600">Approuvez ou rejetez les inscriptions aux formations</p>
            </div>
            <Link 
              href="/admin" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Retour au dashboard
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Annulées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRegistrations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-800 font-medium">
                  {selectedRegistrations.length} inscription(s) sélectionnée(s)
                </span>
                <button
                  onClick={clearSelection}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Désélectionner tout
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setBulkAction('approve');
                    setShowBulkModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approuver tout
                </button>
                <button
                  onClick={() => {
                    setBulkAction('reject');
                    setShowBulkModal(true);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Rejeter tout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registrations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Toutes les Inscriptions</h2>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllPending}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Sélectionner tout (en attente)
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedRegistrations.length === registrations.filter(r => r.status === 'pending').length && registrations.filter(r => r.status === 'pending').length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllPending();
                        } else {
                          clearSelection();
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.includes(registration.id)}
                          onChange={() => toggleRegistrationSelection(registration.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {registration.firstName} {registration.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{registration.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.formation?.Title || 'Formation inconnue'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(registration.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(registration.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {registration.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveRegistration(registration.id)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-sm"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                      {registration.status !== 'pending' && (
                        <span className="text-gray-400">Aucune action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Action Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {bulkAction === 'approve' ? 'Approuver' : 'Rejeter'} {selectedRegistrations.length} inscription(s)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir {bulkAction === 'approve' ? 'approuver' : 'rejeter'} {selectedRegistrations.length} inscription(s) ?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBulkAction}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      bulkAction === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {bulkAction === 'approve' ? 'Approuver' : 'Rejeter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRegistration && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Rejeter l'inscription
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir rejeter l'inscription de {selectedRegistration.firstName} {selectedRegistration.lastName} ?
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du rejet (optionnel)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Ex: Formation complète, informations manquantes..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setSelectedRegistration(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => rejectRegistration(selectedRegistration.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Rejeter
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