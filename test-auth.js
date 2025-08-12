// Simple test script to verify authentication system
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAuth() {
  console.log('🧪 Testing ANIDHI Authentication System\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: API info
    console.log('\n2. Testing API info endpoint...');
    const apiResponse = await axios.get(`${API_URL}/api`);
    console.log('✅ API info:', apiResponse.data.message);

    // Test 3: Register new user
    console.log('\n3. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };

    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, testUser);
    console.log('✅ User registered successfully');
    console.log('   User ID:', registerResponse.data.data.user.id);
    console.log('   Email:', registerResponse.data.data.user.email);

    const accessToken = registerResponse.data.data.tokens.accessToken;

    // Test 4: Login with same user
    console.log('\n4. Testing user login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login successful');

    // Test 5: Get profile (protected route)
    console.log('\n5. Testing protected profile endpoint...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('   Profile ID:', profileResponse.data.data.profile?.id || 'Created');

    // Test 6: Update profile
    console.log('\n6. Testing profile update...');
    const profileUpdate = {
      profession: 'Software Engineer',
      goals: ['Build personal brand', 'Grow network'],
      contextBox: 'I am a passionate software engineer focused on AI and automation.'
    };

    const updateResponse = await axios.put(`${API_URL}/api/auth/profile`, profileUpdate, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Profile updated successfully');
    console.log('   Profession:', updateResponse.data.data.profession);
    console.log('   Goals:', updateResponse.data.data.goals);

    // Test 7: Logout
    console.log('\n7. Testing logout...');
    await axios.post(`${API_URL}/api/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Logout successful');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📝 Test Summary:');
    console.log('   ✅ Health check');
    console.log('   ✅ API info');
    console.log('   ✅ User registration');
    console.log('   ✅ User login');
    console.log('   ✅ Protected routes');
    console.log('   ✅ Profile management');
    console.log('   ✅ Logout');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('\nError details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Run tests
testAuth();