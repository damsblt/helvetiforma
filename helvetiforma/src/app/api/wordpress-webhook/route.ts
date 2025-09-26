import { NextRequest, NextResponse } from 'next/server';

// Webhook endpoint to sync with WordPress/Tutor LMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_id, user_data } = body;

    // Verify webhook secret (add this to your environment variables)
    const webhookSecret = process.env.WORDPRESS_WEBHOOK_SECRET;
    const providedSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'user_registered':
        console.log('User registered in WordPress:', user_id);
        // Here you can add any additional processing needed
        // For example, sync with your content management system
        break;
      
      case 'user_role_updated':
        console.log('User role updated in WordPress:', user_id, user_data?.role);
        break;
      
      case 'tutor_lms_integration_completed':
        console.log('Tutor LMS integration completed for user:', user_id);
        break;
      
      default:
        console.log('Unknown webhook action:', action);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Webhook processing failed' 
    }, { status: 500 });
  }
}

