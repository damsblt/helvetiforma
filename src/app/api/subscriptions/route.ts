import { NextRequest, NextResponse } from 'next/server';
import tutorLmsService from '@/services/tutorLmsService';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching subscriptions...');
    
    const subscriptions = await tutorLmsService.getSubscriptions();

    return NextResponse.json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors du chargement des abonnements: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscriptionData = await request.json();
    
    console.log('Creating subscription:', subscriptionData);
    
    const subscription = await tutorLmsService.createSubscription(subscriptionData);

    return NextResponse.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Create subscription API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors de la création de l'abonnement: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
