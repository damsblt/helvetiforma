'use client';

import { useState } from 'react';
import { wooCommerceCartService } from '@/services/woocommerceCartService';
import { useCart } from '@/contexts/CartContext';

interface CoursePurchaseCardProps {
  course: {
    id: number;
    name: string;
    price: string;
    description: string;
    short_description: string;
    images: Array<{ src: string; alt: string }>;
    tutor_course_id: string;
    course_duration: string;
    course_level: string;
    course_slug: string;
    virtual: boolean;
    downloadable: boolean;
  };
  onAddToCart?: () => void;
}

export default function CoursePurchaseCard({ course, onAddToCart }: CoursePurchaseCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const { getCart } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    setAddSuccess(false);

    try {
      await wooCommerceCartService.addToCart(course.id, 1);
      setAddSuccess(true);
      getCart();
      onAddToCart?.();
      
      // Reset success state after 2 seconds
      setTimeout(() => setAddSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(parseFloat(price));
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'débutant': return 'bg-green-100 text-green-800';
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {course.images && course.images[0] ? (
          <img
            src={course.images[0].src}
            alt={course.images[0].alt || course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl">📚</div>
          </div>
        )}
        
        {/* Course Level Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.course_level)}`}>
            {course.course_level}
          </span>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            ⏱️ {course.course_duration}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.name}
        </h3>

        {/* Course Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.short_description || course.description}
        </p>

        {/* Course Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {course.virtual && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              💻 En ligne
            </span>
          )}
          {course.downloadable && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              📥 Téléchargeable
            </span>
          )}
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(course.price)}
            </span>
            <span className="text-sm text-gray-500">TTC</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              addSuccess
                ? 'bg-green-600 text-white'
                : isAdding
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
            }`}
          >
            {addSuccess ? (
              <span className="flex items-center">
                ✅ Ajouté
              </span>
            ) : isAdding ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ajout...
              </span>
            ) : (
              <span className="flex items-center">
                🛒 Ajouter au panier
              </span>
            )}
          </button>
        </div>

        {/* Course Link */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={`/formations/${course.course_slug}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            Voir les détails du cours →
          </a>
        </div>
      </div>
    </div>
  );
}
