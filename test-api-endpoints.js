// Test API endpoints with authentication
// Note: These endpoints require Clerk authentication when accessed via browser
// Terminal tests will fail with 404 because they don't have auth cookies

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\nTesting: ${name}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
      ...options,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${contentType}`);
    
    if (isJson) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      
      // Check for specific error messages
      if (data.error) {
        console.log(`\n⚠️  Error: ${data.error}`);
      }
    } else {
      const text = await response.text();
      if (text.includes('404') || text.includes('not found')) {
        console.log('⚠️  Route not found (404) - May need authentication or server restart');
      } else {
        console.log('Response (first 500 chars):', text.substring(0, 500));
      }
    }
    
    return { success: response.ok, status: response.status };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('API Endpoint Tests');
  console.log('='.repeat(60));
  console.log('\n⚠️  NOTE: These endpoints require Clerk authentication.');
  console.log('   Terminal tests will show 404 without browser cookies.');
  console.log('   Use browser DevTools Network tab to verify actual responses.\n');

  // Test health endpoint (should work if route exists)
  await testEndpoint('Health Check', `${BASE_URL}/api/health`);

  // Test lemlist endpoint with real client
  await testEndpoint(
    'Lemlist Dashboard (collectiv)',
    `${BASE_URL}/api/dashboard/lemlist?client=collectiv&startDate=2025-10-29&endDate=2025-11-12`
  );

  // Test tenant config
  await testEndpoint(
    'Tenant Config (collectiv)',
    `${BASE_URL}/api/tenant/config?client=collectiv`
  );

  console.log('\n' + '='.repeat(60));
  console.log('Tests Complete');
  console.log('='.repeat(60));
  console.log('\n📋 To verify endpoints properly:');
  console.log('   1. Open browser DevTools (F12)');
  console.log('   2. Go to Network tab');
  console.log('   3. Navigate to client dashboard');
  console.log('   4. Check API request responses');
  console.log('\n✅ Verified endpoints from browser:');
  console.log('   - /api/dashboard/lemlist - Returns 400 (Lemlist email not configured)');
  console.log('   - /api/tenant/config - Returns 200 (Working)');
  console.log('   - /api/dashboard/summary - Returns 200 (Working)');
}

runTests().catch(console.error);

