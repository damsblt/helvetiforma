import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/utils/productCache';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Cache invalidation requested');
    
    // Invalidate all caches (products and blog)
    invalidateCache();
    
    return NextResponse.json({ 
      success: true, 
      message: 'All caches invalidated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API: Error invalidating cache:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to invalidate cache',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST method to invalidate cache',
    timestamp: new Date().toISOString()
  });
}
