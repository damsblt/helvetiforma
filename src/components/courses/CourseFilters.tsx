'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { TutorCategory } from '@/lib/tutor-lms';

interface CourseFiltersProps {
  categories: TutorCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  onClearFilters: () => void;
}

export default function CourseFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
}: CourseFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    level: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const levels = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' },
  ];

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    onPriceRangeChange({
      ...priceRange,
      [type]: value,
    });
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedLevel,
    priceRange.min > 0 || priceRange.max < 1000,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Effacer tout
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories Filter */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Catégories</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedSections.category ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.category && (
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Toutes les catégories</span>
              </label>
              
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category.slug}
                    checked={selectedCategory === category.slug}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({category.count})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Level Filter */}
        <div>
          <button
            onClick={() => toggleSection('level')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Niveau</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedSections.level ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.level && (
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="level"
                  value=""
                  checked={selectedLevel === ''}
                  onChange={(e) => onLevelChange(e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tous les niveaux</span>
              </label>
              
              {levels.map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="radio"
                    name="level"
                    value={level.value}
                    checked={selectedLevel === level.value}
                    onChange={(e) => onLevelChange(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Prix</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedSections.price ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.price && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Prix minimum (CHF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Prix maximum (CHF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 1000)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Prix: {priceRange.min} - {priceRange.max} CHF
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
