'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartService, CartItem } from '@/services/cartService';

interface CartButtonProps {
  courseId: number;
  courseTitle: string;
  coursePrice: number;
  courseSalePrice?: number;
  courseSlug: string;
  courseFeaturedImage?: string;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function CartButton({ 
  courseId, 
  courseTitle, 
  coursePrice, 
  courseSalePrice, 
  courseSlug, 
  courseFeaturedImage, 
  className = '', 
  showIcon = true, 
  children 
}: CartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      
      const cartItem: CartItem = {
        course_id: courseId,
        title: courseTitle,
        price: coursePrice,
        sale_price: courseSalePrice,
        slug: courseSlug,
        featured_image: courseFeaturedImage
      };

      cartService.addToCart(cartItem);
      
      // Redirect to cart page
      router.push('/panier');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
      title="Ajouter au panier"
    >
      {showIcon && (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      )}
      {isAdding ? 'Ajout...' : (children || 'Ajouter au panier')}
    </button>
  );
}


