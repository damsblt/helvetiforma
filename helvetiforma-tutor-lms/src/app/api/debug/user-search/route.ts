import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier') || 'damien.balet@me.com';

    const results = [];

    // Test 1: Search by email
    try {
      const searchResponse = await fetch(buildUrl(`/wp-json/wp/v2/users?search=${encodeURIComponent(identifier)}`), {
        headers: getAuthHeaders(),
      });

      const searchData = searchResponse.ok ? await searchResponse.json() : null;
      results.push({
        method: 'Search by email',
        status: searchResponse.status,
        success: searchResponse.ok,
        query: `/wp-json/wp/v2/users?search=${encodeURIComponent(identifier)}`,
        found: Array.isArray(searchData) ? searchData.length : 0,
        users: searchData
      });
    } catch (error) {
      results.push({
        method: 'Search by email',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Get all users (to see if user exists at all)
    try {
      const allUsersResponse = await fetch(buildUrl('/wp-json/wp/v2/users'), {
        headers: getAuthHeaders(),
      });

      const allUsers = allUsersResponse.ok ? await allUsersResponse.json() : null;
      const matchingUser = Array.isArray(allUsers) ? 
        allUsers.find(u => u.email === identifier || u.username === identifier) : null;

      results.push({
        method: 'Get all users',
        status: allUsersResponse.status,
        success: allUsersResponse.ok,
        totalUsers: Array.isArray(allUsers) ? allUsers.length : 0,
        matchingUser: matchingUser ? {
          id: matchingUser.id,
          name: matchingUser.name,
          email: matchingUser.email,
          username: matchingUser.username
        } : null
      });
    } catch (error) {
      results.push({
        method: 'Get all users',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Try direct user ID 1 (since we know it's the admin)
    try {
      const userResponse = await fetch(buildUrl('/wp-json/wp/v2/users/1?context=edit'), {
        headers: getAuthHeaders(),
      });

      const userData = userResponse.ok ? await userResponse.json() : null;
      results.push({
        method: 'Direct user ID 1',
        status: userResponse.status,
        success: userResponse.ok,
        user: userData ? {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          roles: userData.roles
        } : null
      });
    } catch (error) {
      results.push({
        method: 'Direct user ID 1',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json({
      identifier,
      server: config.wordpressUrl,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        searchFound: results.find(r => r.method === 'Search by email')?.found || 0,
        userExists: !!results.find(r => r.method === 'Get all users')?.matchingUser,
        directAccessWorks: results.find(r => r.method === 'Direct user ID 1')?.success || false
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
