'use client';

import { motion } from 'framer-motion';
import { Star, Clock, Users, Play, Lock, CheckCircle, BookOpen, Award, Heart, Share2 } from 'lucide-react';
import { UnifiedContent, getContentPricing, getContentAction, canUserAccessContent } from '@/lib/unified-payment';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

interface UnifiedContentCardProps {
  content: UnifiedContent;
  hasPurchased?: boolean;
  className?: string;
}

export default function UnifiedContentCard({ 
  content, 
  hasPurchased = false, 
  className = "" 
}: UnifiedContentCardProps) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const pricing = getContentPricing(content);
  const action = getContentAction(content, user, hasPurchased);
  const canAccess = canUserAccessContent(content, user, hasPurchased);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return level;
    }
  };

  const getContentIcon = () => {
    if (content.type === 'course') {
      return content.isCompleted ? Award : BookOpen;
    }
    return BookOpen;
  };

  const ContentIcon = getContentIcon();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${className}`}
    >
      {/* Content Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {content.image ? (
          <img
            src={content.image}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ContentIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Content Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            content.type === 'course' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {content.type === 'course' ? 'Formation' : 'Article'}
          </span>
        </div>

        {/* Level Badge (for courses) */}
        {content.type === 'course' && content.level && (
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(content.level)}`}>
              {getLevelLabel(content.level)}
            </span>
          </div>
        )}

        {/* Price Badge */}
        {!pricing.isFree && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
              {pricing.displayPrice}
            </span>
          </div>
        )}

        {/* Access Status */}
        {canAccess && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {content.type === 'course' ? 'Inscrit' : 'Acheté'}
            </div>
          </div>
        )}

        {/* Progress Bar (for courses) */}
        {content.type === 'course' && content.progressPercentage && content.progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progression</span>
              <span>{content.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${content.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-6">
        {/* Categories */}
        {content.categories && content.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {content.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {content.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {content.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{content.duration}</span>
            </div>
          )}
          
          {content.author && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{content.author}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {content.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <Link
              href={action.href || '#'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                action.type === 'continue' || action.type === 'view'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : action.type === 'enroll' || action.type === 'purchase'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {action.type === 'continue' && <Play className="w-4 h-4" />}
              {action.type === 'view' && <BookOpen className="w-4 h-4" />}
              {action.type === 'enroll' && <Lock className="w-4 h-4" />}
              {action.type === 'purchase' && <Lock className="w-4 h-4" />}
              {action.type === 'login' && <Lock className="w-4 h-4" />}
              {action.text}
            </Link>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <button className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
