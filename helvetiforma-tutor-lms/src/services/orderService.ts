// Order Service for handling checkout and payment flow

import { cartService, Cart } from './cartService';
import { authService } from './authService';
import type { TutorOrder, BillingInfo, PaymentMethod } from '@/types/tutor';

export interface CheckoutData {
  billingInfo: BillingInfo;
  paymentMethod: string;
  cart: Cart;
  userId: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order?: TutorOrder;
  redirect_url?: string;
  payment_required?: boolean;
  amount?: number;
  currency?: string;
}

class OrderService {
  
  // Get available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'stripe',
        name: 'Carte de crédit/débit',
        description: 'Visa, Mastercard, American Express',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Paiement sécurisé via PayPal',
        enabled: true
      },
      {
        id: 'bank_transfer',
        name: 'Virement bancaire',
        description: 'Paiement par virement bancaire (traitement 1-3 jours)',
        enabled: true
      }
    ];
  }

  // Create order from cart
  async createOrder(checkoutData: CheckoutData): Promise<OrderResponse> {
    try {
      const { cart, userId, billingInfo, paymentMethod } = checkoutData;

      if (cart.items.length === 0) {
        return {
          success: false,
          message: 'Votre panier est vide'
        };
      }

      // For multiple items, create individual orders for each course
      const orderPromises = cart.items.map(async (item) => {
        const response = await fetch('/api/tutor/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            course_id: item.course_id,
            payment_method: paymentMethod,
            billing_info: billingInfo
          }),
        });

        return response.json();
      });

      const orderResults = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const failedOrders = orderResults.filter(result => !result.success);
      if (failedOrders.length > 0) {
        return {
          success: false,
          message: 'Erreur lors de la création de certaines commandes'
        };
      }

      // Calculate total amount
      const totalAmount = cart.total;
      const hasPaidCourses = orderResults.some(result => result.payment_required);

      if (!hasPaidCourses) {
        // All courses are free, clear cart and redirect to dashboard
        cartService.clearCart();
        return {
          success: true,
          message: 'Inscription réussie à toutes les formations gratuites',
          redirect_url: '/tableau-de-bord'
        };
      }

      // For paid courses, prepare payment
      return {
        success: true,
        message: 'Commandes créées avec succès',
        payment_required: true,
        amount: totalAmount,
        currency: 'CHF',
        order: orderResults[0].order // Return first order as reference
      };

    } catch (error) {
      console.error('Order creation error:', error);
      return {
        success: false,
        message: 'Erreur lors de la création de la commande'
      };
    }
  }

  // Process payment (mock implementation)
  async processPayment(orderId: number, paymentMethod: string, paymentData?: any): Promise<OrderResponse> {
    try {
      // This is a mock implementation
      // In a real application, you would integrate with actual payment providers
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

      // Mock success for demonstration
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        // Auto-enroll user in purchased courses
        try {
          const cart = cartService.getCart();
          const user = authService.getUser();
          
          if (user && cart.items.length > 0) {
            const enrollmentPromises = cart.items.map(async (item) => {
              try {
                const enrollResponse = await fetch('/api/tutor/auto-enroll', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user_id: user.id,
                    course_id: item.course_id,
                    order_id: orderId,
                    payment_status: 'completed'
                  })
                });
                
                const enrollResult = await enrollResponse.json();
                console.log(`Auto-enrollment for course ${item.course_id}:`, enrollResult);
                return enrollResult;
              } catch (error) {
                console.error(`Auto-enrollment failed for course ${item.course_id}:`, error);
                return { success: false, course_id: item.course_id, error };
              }
            });
            
            const enrollmentResults = await Promise.all(enrollmentPromises);
            console.log('All auto-enrollment results:', enrollmentResults);
          }
        } catch (error) {
          console.error('Auto-enrollment process error:', error);
          // Don't fail the payment if enrollment fails
        }
        
        // Clear cart after successful payment
        cartService.clearCart();
        
        return {
          success: true,
          message: 'Paiement traité avec succès',
          redirect_url: '/tableau-de-bord'
        };
      } else {
        return {
          success: false,
          message: 'Échec du paiement. Veuillez réessayer.'
        };
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: 'Erreur lors du traitement du paiement'
      };
    }
  }

  // Validate billing information
  validateBillingInfo(billingInfo: BillingInfo): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!billingInfo.firstName.trim()) {
      errors.push('Le prénom est requis');
    }

    if (!billingInfo.lastName.trim()) {
      errors.push('Le nom de famille est requis');
    }

    if (!billingInfo.email.trim()) {
      errors.push('L\'adresse e-mail est requise');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      errors.push('L\'adresse e-mail n\'est pas valide');
    }

    if (!billingInfo.country.trim()) {
      errors.push('Le pays est requis');
    }

    if (!billingInfo.city.trim()) {
      errors.push('La ville est requise');
    }

    if (!billingInfo.postalCode.trim()) {
      errors.push('Le code postal est requis');
    }

    if (!billingInfo.address.trim()) {
      errors.push('L\'adresse est requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get countries list
  getCountries(): { code: string; name: string }[] {
    return [
      { code: 'CH', name: 'Suisse' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Allemagne' },
      { code: 'IT', name: 'Italie' },
      { code: 'AT', name: 'Autriche' },
      { code: 'BE', name: 'Belgique' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'NL', name: 'Pays-Bas' },
      { code: 'ES', name: 'Espagne' },
      { code: 'PT', name: 'Portugal' },
      { code: 'GB', name: 'Royaume-Uni' },
      { code: 'US', name: 'États-Unis' },
      { code: 'CA', name: 'Canada' },
    ];
  }

  // Get Swiss states/cantons
  getSwissStates(): { code: string; name: string }[] {
    return [
      { code: 'AG', name: 'Argovie' },
      { code: 'AI', name: 'Appenzell Rhodes-Intérieures' },
      { code: 'AR', name: 'Appenzell Rhodes-Extérieures' },
      { code: 'BE', name: 'Berne' },
      { code: 'BL', name: 'Bâle-Campagne' },
      { code: 'BS', name: 'Bâle-Ville' },
      { code: 'FR', name: 'Fribourg' },
      { code: 'GE', name: 'Genève' },
      { code: 'GL', name: 'Glaris' },
      { code: 'GR', name: 'Grisons' },
      { code: 'JU', name: 'Jura' },
      { code: 'LU', name: 'Lucerne' },
      { code: 'NE', name: 'Neuchâtel' },
      { code: 'NW', name: 'Nidwald' },
      { code: 'OW', name: 'Obwald' },
      { code: 'SG', name: 'Saint-Gall' },
      { code: 'SH', name: 'Schaffhouse' },
      { code: 'SO', name: 'Soleure' },
      { code: 'SZ', name: 'Schwytz' },
      { code: 'TG', name: 'Thurgovie' },
      { code: 'TI', name: 'Tessin' },
      { code: 'UR', name: 'Uri' },
      { code: 'VD', name: 'Vaud' },
      { code: 'VS', name: 'Valais' },
      { code: 'ZG', name: 'Zoug' },
      { code: 'ZH', name: 'Zurich' },
    ];
  }
}

export const orderService = new OrderService();
