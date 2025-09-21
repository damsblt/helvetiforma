'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Formation {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: string;
  icon: string;
  color: string;
  features: string[];
  theme?: string;
  difficulty?: string;
  type?: string;
}

const formations: Formation[] = [
  {
    id: 'salaires',
    title: 'Gestion des Salaires',
    description: 'Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. Formation pratique avec cas concrets et outils modernes.',
    duration: '3 jours',
    level: 'Intermédiaire',
    price: 'CHF 1,200',
    icon: '💰',
    color: 'blue',
    theme: 'salaires',
    difficulty: 'Intermédiaire',
    type: 'Présentiel',
    features: [
      'Calcul des salaires et avantages',
      'Conformité légale suisse',
      'Outils de gestion RH',
      'Gestion des congés et absences'
    ]
  },
  {
    id: 'charges-sociales',
    title: 'Charges Sociales & Cotisations',
    description: 'Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres assurances sociales en entreprise.',
    duration: '2 jours',
    level: 'Avancé',
    price: 'CHF 980',
    icon: '🏢',
    color: 'green',
    theme: 'charges sociales',
    difficulty: 'Avancé',
    type: 'Présentiel',
    features: [
      'AVS, AI, APG et LPP',
      'Calcul des cotisations',
      'Déclarations sociales',
      'Optimisation fiscale'
    ]
  },
  {
    id: 'impot-a-la-source',
    title: 'Impôt à la Source',
    description: 'Formation spécialisée sur l\'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Procédures et bonnes pratiques.',
    duration: '1.5 jours',
    level: 'Spécialisé',
    price: 'CHF 750',
    icon: '🌍',
    color: 'purple',
    theme: 'impôt à la source',
    difficulty: 'Spécialisé',
    type: 'Présentiel',
    features: [
      'Réglementation suisse',
      'Calcul de l\'impôt à la source',
      'Déclarations fiscales',
      'Cas particuliers frontaliers'
    ]
  }
];

export default function FormationEditPage() {
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Formation>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const formationId = params.id as string;
    const foundFormation = formations.find(f => f.id === formationId);
    setFormation(foundFormation || null);
    if (foundFormation) {
      setFormData(foundFormation);
    }
    setIsLoading(false);
  }, [params.id]);

  const handleInputChange = (field: keyof Formation, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (!formData.features) return;
    
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    if (!formData.features) return;
    
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  const removeFeature = (index: number) => {
    if (!formData.features) return;
    
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically make an API call to save the formation
      console.log('Saving formation:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the formation state
      setFormation(formData as Formation);
      setIsEditing(false);
      
      // Show success message (you could add a toast notification here)
      alert('Formation mise à jour avec succès!');
      
    } catch (error) {
      console.error('Error saving formation:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (formation) {
      setFormData(formation);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Formation non trouvée</h1>
          <p className="text-gray-600 mb-4">Cette formation n'existe pas.</p>
          <Link 
            href="/admin/calendar" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au calendrier
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/admin" className="hover:text-blue-600">Admin</Link></li>
              <li><span className="mx-2">/</span></li>
              <li><Link href="/admin/calendar" className="hover:text-blue-600">Calendrier</Link></li>
              <li><span className="mx-2">/</span></li>
              <li className="text-gray-900 font-medium">Modifier Formation</li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Modifier la Formation' : 'Détails de la Formation'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditing ? 'Modifiez les informations de la formation' : 'Consultez et modifiez les détails de la formation'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formation.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formation.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formation.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.level || ''}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Spécialisé">Spécialisé</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{formation.level}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formation.price}</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informations supplémentaires</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.theme || ''}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formation.theme || 'Non spécifié'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.type || ''}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Présentiel">Présentiel</option>
                      <option value="En ligne">En ligne</option>
                      <option value="Hybride">Hybride</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{formation.type || 'Non spécifié'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.difficulty || ''}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Spécialisé">Spécialisé</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{formation.difficulty || 'Non spécifié'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités</h3>
              
              {isEditing ? (
                <div className="space-y-3">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Fonctionnalité..."
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg"
                  >
                    + Ajouter une fonctionnalité
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {formation.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

