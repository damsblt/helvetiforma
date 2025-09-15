'use client';

import React, { useState, useEffect } from 'react';

interface Subscription {
  id: number;
  name: string;
  description: string;
  price: string;
  billing_cycle: string;
  status: string;
  features: string[];
}

interface SubscriptionManagerProps {
  studentId?: number;
}

export default function SubscriptionManager({ studentId }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    features: ['']
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions');
      const result = await response.json();
      
      if (result.success) {
        setSubscriptions(result.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSubscription,
          features: newSubscription.features.filter(f => f.trim() !== ''),
          student_id: studentId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateForm(false);
        setNewSubscription({
          name: '',
          description: '',
          price: '',
          billing_cycle: 'monthly',
          features: ['']
        });
        loadSubscriptions();
      } else {
        console.error('Error creating subscription:', result.error);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const addFeature = () => {
    setNewSubscription({
      ...newSubscription,
      features: [...newSubscription.features, '']
    });
  };

  const removeFeature = (index: number) => {
    setNewSubscription({
      ...newSubscription,
      features: newSubscription.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...newSubscription.features];
    newFeatures[index] = value;
    setNewSubscription({
      ...newSubscription,
      features: newFeatures
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl font-semibold text-gray-700">Chargement des abonnements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Abonnements</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Créer un Abonnement
        </button>
      </div>

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{subscription.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{subscription.description}</p>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-600">{subscription.price}</span>
              <span className="text-gray-500 ml-2">/{subscription.billing_cycle}</span>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Fonctionnalités:</h4>
              <ul className="space-y-1">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Modifier
              </button>
              <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun abonnement trouvé</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer le premier abonnement
          </button>
        </div>
      )}

      {/* Create Subscription Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Créer un Abonnement</h2>
            
            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'abonnement
                </label>
                <input
                  type="text"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSubscription.description}
                  onChange={(e) => setNewSubscription({...newSubscription, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix
                  </label>
                  <input
                    type="text"
                    value={newSubscription.price}
                    onChange={(e) => setNewSubscription({...newSubscription, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="29.99 CHF"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle de facturation
                  </label>
                  <select
                    value={newSubscription.billing_cycle}
                    onChange={(e) => setNewSubscription({...newSubscription, billing_cycle: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                    <option value="lifetime">À vie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonctionnalités
                </label>
                {newSubscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Fonctionnalité..."
                    />
                    {newSubscription.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Ajouter une fonctionnalité
                </button>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer l'abonnement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
