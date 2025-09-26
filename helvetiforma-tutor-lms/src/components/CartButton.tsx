'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartService, CartItem } from '@/services/cartService';
import { toastService } from '@/components/Toast';

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
  const [justAdded, setJustAdded] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const router = useRouter();

  // Check if item is already in cart
  useEffect(() => {
    setIsInCart(cartService.isInCart(courseId));
  }, [courseId]);

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

      const result = cartService.addToCart(cartItem);
      
      if (result.items.some(item => item.course_id === courseId)) {
        setIsInCart(true);
        setJustAdded(true);
        
        // Show success toast
        toastService.success(
          'Formation ajoutée !',
          `"${courseTitle}" a été ajouté à votre panier.`
        );
        
        // Show success feedback for 2 seconds
        setTimeout(() => {
          setJustAdded(false);
        }, 2000);
      } else {
        // Course already in cart
        toastService.warning(
          'Déjà dans le panier',
          `"${courseTitle}" est déjà dans votre panier.`
        );
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toastService.error(
        'Erreur',
        'Impossible d\'ajouter la formation au panier. Veuillez réessayer.'
      );
    } finally {
      setIsAdding(false);
    }
  };

  const goToCart = () => {
    router.push('/panier');
  };

  // If just added, show success state
  if (justAdded) {
    return (
      <button
        onClick={goToCart}
        className={`${className} bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all duration-300`}
        title="Voir le panier"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Ajouté ! Voir le panier
      </button>
    );
  }

  // If already in cart, show "view cart" button
  if (isInCart && !isAdding) {
    return (
      <button
        onClick={goToCart}
        className={`${className} bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center`}
        title="Voir le panier"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        Voir le panier
      </button>
    );
  }

  // Default add to cart button
  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200`}
      title="Ajouter au panier"
    >
      {showIcon && (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      )}
      {isAdding ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Ajout...
        </>
      ) : (
        children || 'Ajouter au panier'
      )}
    </button>
  );
}


