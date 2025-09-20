import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : 10,
      search: searchParams.get('search') || undefined,
      email: searchParams.get('email') || undefined,
    };

    const customers = await wooCommerceService.getCustomers(params);

    return NextResponse.json({
      success: true,
      data: customers,
      message: 'Customers retrieved successfully'
    });

  } catch (error) {
    console.error('WooCommerce customers API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch customers',
        message: 'Erreur lors de la récupération des clients'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();

    // Validate required fields
    if (!customerData.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Customer email is required',
          message: 'L\'email du client est requis'
        },
        { status: 400 }
      );
    }

    const customer = await wooCommerceService.createCustomer(customerData);

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });

  } catch (error) {
    console.error('WooCommerce create customer API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create customer',
        message: 'Erreur lors de la création du client'
      },
      { status: 500 }
    );
  }
}
