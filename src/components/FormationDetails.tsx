'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import InPersonSubscription from './InPersonSubscription';
import EditableContent from './EditableContent';
import { contentService } from '@/services/contentService';

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
}

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  short_description: string;
  images: any[];
  tutor_course_id: number;
  course_duration: string;
  course_level: string;
  course_slug: string;
  virtual: boolean;
  downloadable: boolean;
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
    features: [
      'Réglementation suisse',
      'Calcul de l\'impôt à la source',
      'Déclarations fiscales',
      'Cas particuliers frontaliers'
    ]
  }
];

interface FormationDetailsProps {
  formationId: string;
}

export default function FormationDetails({ formationId }: FormationDetailsProps) {
  const { addToCart } = useCart();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [eLearningProducts, setELearningProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const loadFormation = async () => {
      try {
        const content = await contentService.getContent();
        
        // Get formation data based on formationId
        let formationData: Formation | null = null;
        
        if (formationId === 'salaires') {
          formationData = {
            id: 'salaires',
            title: content.formationSalairesCardTitle || 'Gestion des Salaires',
            description: content.formationSalairesCardDescription || 'Maîtrisez la gestion complète des salaires, des avantages sociaux et de la paie en Suisse. Formation pratique avec cas concrets et outils modernes.',
            duration: content.formationSalairesCardDuration || '3 jours',
            level: content.formationSalairesCardLevel || 'Intermédiaire',
            price: content.formationSalairesCardPrice || 'CHF 1,200',
            icon: content.formationSalairesIcon || '💰',
            color: 'blue',
            features: [
              content.formationSalairesFeature1 || 'Calcul des salaires et avantages',
              content.formationSalairesFeature2 || 'Conformité légale suisse',
              content.formationSalairesFeature3 || 'Outils de gestion RH',
              content.formationSalairesFeature4 || 'Gestion des congés et absences'
            ]
          };
        } else if (formationId === 'charges-sociales') {
          formationData = {
            id: 'charges-sociales',
            title: content.formationChargesSocialesCardTitle || 'Charges Sociales & Cotisations',
            description: content.formationChargesSocialesCardDescription || 'Comprenez et gérez efficacement les charges sociales, les cotisations AVS, LPP et autres assurances sociales en entreprise.',
            duration: content.formationChargesSocialesCardDuration || '2 jours',
            level: content.formationChargesSocialesCardLevel || 'Avancé',
            price: content.formationChargesSocialesCardPrice || 'CHF 980',
            icon: content.formationChargesSocialesIcon || '🏢',
            color: 'green',
            features: [
              content.formationChargesSocialesFeature1 || 'AVS, AI, APG et LPP',
              content.formationChargesSocialesFeature2 || 'Calcul des cotisations',
              content.formationChargesSocialesFeature3 || 'Déclarations sociales',
              content.formationChargesSocialesFeature4 || 'Optimisation fiscale'
            ]
          };
        } else if (formationId === 'impot-a-la-source') {
          formationData = {
            id: 'impot-a-la-source',
            title: content.formationImpotALaSourceCardTitle || 'Impôt à la Source',
            description: content.formationImpotALaSourceCardDescription || 'Formation spécialisée sur l\'impôt à la source pour les travailleurs frontaliers et étrangers en Suisse. Procédures et bonnes pratiques.',
            duration: content.formationImpotALaSourceCardDuration || '1.5 jours',
            level: content.formationImpotALaSourceCardLevel || 'Spécialisé',
            price: content.formationImpotALaSourceCardPrice || 'CHF 750',
            icon: content.formationImpotALaSourceIcon || '🌍',
            color: 'purple',
            features: [
              content.formationImpotALaSourceFeature1 || 'Réglementation suisse',
              content.formationImpotALaSourceFeature2 || 'Calcul de l\'impôt à la source',
              content.formationImpotALaSourceFeature3 || 'Déclarations fiscales',
              content.formationImpotALaSourceFeature4 || 'Cas particuliers frontaliers'
            ]
          };
        }
        
        setFormation(formationData);
      } catch (error) {
        console.error('Error loading formation:', error);
        // Fallback to hardcoded data
        const foundFormation = formations.find(f => f.id === formationId);
        setFormation(foundFormation || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormation();
  }, [formationId]);

  useEffect(() => {
    fetchELearningProducts();
  }, []);

  useEffect(() => {
    if (formation) {
      filterProducts();
    }
  }, [formation, eLearningProducts, filterText]);

  const fetchELearningProducts = async () => {
    try {
      const response = await fetch('/api/woocommerce/course-products');
      const result = await response.json();
      
      if (result.success && result.data) {
        setELearningProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching eLearning products:', error);
    }
  };

  const filterProducts = () => {
    if (!formation) return;
    
    // Create search terms based on formation
    const searchTerms = [
      formation.title.toLowerCase(),
      formation.id.toLowerCase(),
      // Add specific variations for each formation
      ...(formation.id === 'salaires' ? ['gestion des salaires', 'salaires'] : []),
      ...(formation.id === 'charges-sociales' ? ['charges sociales', 'charges-sociales', 'cotisations'] : []),
      ...(formation.id === 'impot-a-la-source' ? ['impôt à la source', 'impot a la source', 'impôt', 'impot'] : [])
    ];

    let filtered = eLearningProducts.filter(product => {
      const productName = product.name.toLowerCase();
      const productDescription = product.description.toLowerCase();
      
      // Check if product name contains any of the search terms
      return searchTerms.some(term => 
        productName.includes(term) || productDescription.includes(term)
      );
    });

    // Apply additional filter if user typed something
    if (filterText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filterText.toLowerCase()) ||
        product.description.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la formation...</p>
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
            href="/formations" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-blue-600">Accueil</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/formations" className="hover:text-blue-600">Formations</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium">{formation.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Formation Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <EditableContent
                fieldName={`formation${formationId.charAt(0).toUpperCase() + formationId.slice(1)}CardTitle`}
                value={formation.title}
                type="text"
                className="text-3xl font-bold text-gray-900 mb-4"
                onSave={(value) => {
                  setFormation(prev => prev ? { ...prev, title: value } : null);
                }}
              >
                {formation.title}
              </EditableContent>
              
              <EditableContent
                fieldName={`formation${formationId.charAt(0).toUpperCase() + formationId.slice(1)}CardDescription`}
                value={formation.description}
                type="textarea"
                className="text-gray-600 mb-6"
                onSave={(value) => {
                  setFormation(prev => prev ? { ...prev, description: value } : null);
                }}
              >
                {formation.description}
              </EditableContent>
              
              {/* Formation Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Durée</span>
                  <EditableContent
                    fieldName={`formation${formationId.charAt(0).toUpperCase() + formationId.slice(1)}CardDuration`}
                    value={formation.duration}
                    type="text"
                    className="text-lg font-semibold text-gray-900"
                    onSave={(value) => {
                      setFormation(prev => prev ? { ...prev, duration: value } : null);
                    }}
                  >
                    {formation.duration}
                  </EditableContent>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Niveau</span>
                  <EditableContent
                    fieldName={`formation${formationId.charAt(0).toUpperCase() + formationId.slice(1)}CardLevel`}
                    value={formation.level}
                    type="text"
                    className="text-lg font-semibold text-gray-900"
                    onSave={(value) => {
                      setFormation(prev => prev ? { ...prev, level: value } : null);
                    }}
                  >
                    {formation.level}
                  </EditableContent>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Prix</span>
                  <EditableContent
                    fieldName={`formation${formationId.charAt(0).toUpperCase() + formationId.slice(1)}CardPrice`}
                    value={formation.price}
                    type="text"
                    className="text-lg font-semibold text-gray-900"
                    onSave={(value) => {
                      setFormation(prev => prev ? { ...prev, price: value } : null);
                    }}
                  >
                    {formation.price}
                  </EditableContent>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <p className="text-lg font-semibold text-gray-900">Formation</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Points clés</h3>
                <ul className="space-y-2">
                  {formation.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <EditableContent
                        fieldName={`formation${formationId.charAt(0).toUpperCase() + formationId.slice(1)}Feature${index + 1}`}
                        value={feature}
                        type="text"
                        className="text-gray-700"
                        onSave={(value) => {
                          const updatedFeatures = [...formation.features];
                          updatedFeatures[index] = value;
                          setFormation(prev => prev ? { ...prev, features: updatedFeatures } : null);
                        }}
                      >
                        {feature}
                      </EditableContent>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Options */}
          <div className="space-y-6">
            {/* eLearning Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">eLearning</h2>
              
              {/* Product Filter */}
              <div className="mb-4">
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Rechercher un cours..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Product List */}
              <div className="space-y-3">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.course_duration} • {product.course_level}</p>
                        <p className="text-sm font-semibold text-blue-600">{product.price} CHF</p>
                      </div>
                      <Link
                        href={`/courses/${product.tutor_course_id || product.id}`}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
                      >
                        Voir les détails
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun cours eLearning trouvé pour cette formation.</p>
                  </div>
                )}
              </div>
            </div>

            {/* inPerson Section */}
            <InPersonSubscription
              formationSlug={formationId}
              formationTitle="Formation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
