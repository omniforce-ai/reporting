// Quick test script for Lemlist API
// Usage: node test_lemlist_api.js <api_key>

const email = 'alistair@omniforce.ai';
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node test_lemlist_api.js <api_key>');
  process.exit(1);
}

const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64');

async function test() {
  try {
    console.log('Testing Lemlist API endpoints...\n');
    
    // Test campaigns endpoint
    console.log('1. Testing /campaigns endpoint...');
    const campaignsRes = await fetch('https://api.lemlist.com/api/campaigns?version=v2', {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${campaignsRes.status}`);
    if (campaignsRes.ok) {
      const campaigns = await campaignsRes.json();
      console.log(`   ✅ Found ${Array.isArray(campaigns) ? campaigns.length : 0} campaigns`);
      if (Array.isArray(campaigns) && campaigns.length > 0) {
        console.log(`   Sample campaign: ${JSON.stringify(campaigns[0], null, 2).substring(0, 200)}...`);
      }
    } else {
      const error = await campaignsRes.text();
      console.log(`   ❌ Error: ${error}`);
    }
    
    // Test activities endpoint
    console.log('\n2. Testing /activities endpoint...');
    const activitiesRes = await fetch('https://api.lemlist.com/api/activities?version=v2&limit=5', {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${activitiesRes.status}`);
    if (activitiesRes.ok) {
      const activities = await activitiesRes.json();
      console.log(`   ✅ Found ${Array.isArray(activities) ? activities.length : 0} activities`);
      if (Array.isArray(activities) && activities.length > 0) {
        const types = [...new Set(activities.map(a => a.type))];
        console.log(`   Activity types found: ${types.join(', ')}`);
      }
    } else {
      const error = await activitiesRes.text();
      console.log(`   ❌ Error: ${error}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();
