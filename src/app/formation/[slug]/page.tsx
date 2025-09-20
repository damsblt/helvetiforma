'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import InPersonSubscription from '@/components/InPersonSubscription';

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

export default function FormationDetailsPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [eLearningProducts, setELearningProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  console.log('FormationDetailsPage render - params:', params);
  console.log('FormationDetailsPage render - isLoading:', isLoading);
  console.log('FormationDetailsPage render - formation:', formation);

  useEffect(() => {
    const slug = params.slug as string;
    console.log('Formation page - slug:', slug);
    console.log('Formation page - formations:', formations.map(f => f.id));
    const foundFormation = formations.find(f => f.id === slug);
    console.log('Formation page - foundFormation:', foundFormation);
    setFormation(foundFormation || null);
    setIsLoading(false);
  }, [params.slug]);

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
    if (!formation) {
      console.log('Formation page - filterProducts: no formation');
      return;
    }
    
    console.log('Formation page - filterProducts: formation:', formation.title);
    console.log('Formation page - filterProducts: eLearningProducts count:', eLearningProducts.length);
    console.log('Formation page - filterProducts: eLearningProducts:', eLearningProducts.map(p => p.name));
    
    // Normalize text for better matching (remove accents, convert to lowercase)
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
        .trim();
    };

    const normalizedFormationTitle = normalizeText(formation.title);
    const normalizedFormationId = normalizeText(formation.id);
    
    let filtered = eLearningProducts.filter(product => {
      const normalizedProductName = normalizeText(product.name);
      const normalizedProductDescription = normalizeText(product.description || '');
      
      return normalizedProductName.includes(normalizedFormationTitle) ||
             normalizedProductName.includes(normalizedFormationId) ||
             normalizedProductDescription.includes(normalizedFormationTitle) ||
             // Additional matching for "impot" variations
             (normalizedFormationId.includes('impot') && normalizedProductName.includes('impot')) ||
             (normalizedFormationTitle.includes('impot') && normalizedProductName.includes('impot'));
    });

    console.log('Formation page - filterProducts: filtered count:', filtered.length);
    console.log('Formation page - filterProducts: filtered products:', filtered.map(p => p.name));

    if (filterText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-600 to-gray-700';
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formation.title}</h1>
              <p className="text-gray-600 mb-6">{formation.description}</p>
              
              {/* Formation Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Durée</span>
                  <p className="text-lg font-semibold text-gray-900">{formation.duration}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Niveau</span>
                  <p className="text-lg font-semibold text-gray-900">{formation.level}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Prix</span>
                  <p className="text-lg font-semibold text-gray-900">{formation.price}</p>
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
                      <span className="text-gray-700">{feature}</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtre where :
                </label>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Product name <span className="font-mono bg-gray-100 px-2 py-1 rounded">contains</span> Course name
                  </div>
                  <div className="text-sm text-gray-500">
                    exemple: "Impôt à la Source - 1re année" <span className="font-mono bg-gray-100 px-2 py-1 rounded">contains</span> "Impôt à la source"
                  </div>
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Rechercher un cours..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add to cart
                      </button>
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
              formationSlug={formation.id}
              formationTitle={formation.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
