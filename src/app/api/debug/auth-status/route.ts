import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    // Check authentication status
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();
    const token = authService.getToken();

    // Try to validate the token
    let tokenValid = false;
    try {
      tokenValid = await authService.validateToken();
    } catch (error) {
      console.warn('Token validation failed:', error);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      authentication: {
        isAuthenticated,
        tokenValid,
        hasUser: !!user,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenType: token?.includes('wordpress_') ? 'cookie' : 
                  (token && token.length > 50 && !token.includes(' ')) ? 'session' : 
                  (token && token.includes(' ')) ? 'app_password' : 'unknown'
      },
      user: user ? {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        isAdmin: user.isAdmin,
        isInstructor: user.isInstructor,
        isStudent: user.isStudent
      } : null,
      recommendations: !isAuthenticated ? [
        'User needs to log in',
        'Try visiting /tutor-login page',
        'Check if session expired'
      ] : !tokenValid ? [
        'Token validation failed',
        'May need to re-login',
        'Check WordPress connection'
      ] : [
        'Authentication looks good',
        'Ready for API calls'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check auth status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
