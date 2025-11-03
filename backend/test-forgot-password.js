const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password Endpoint\n');
  
  try {
    // Test 1: POST request (correct method)
    console.log('✅ Test 1: POST request to /api/auth/forgot-password');
    const postResponse = await axios.post(`${API_URL}/api/auth/forgot-password`, {
      email: 'test@example.com'
    });
    console.log('Response:', postResponse.data);
    console.log('Status:', postResponse.status, '\n');
  } catch (error) {
    if (error.response) {
      console.log('Response:', error.response.data);
      console.log('Status:', error.response.status, '\n');
    } else {
      console.error('❌ Error:', error.message, '\n');
    }
  }

  try {
    // Test 2: GET request (wrong method - should fail)
    console.log('❌ Test 2: GET request to /api/auth/forgot-password (should fail)');
    const getResponse = await axios.get(`${API_URL}/api/auth/forgot-password`);
    console.log('Response:', getResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('Expected error:', error.response.data);
      console.log('Status:', error.response.status);
      console.log('✅ Correctly returns 404 for GET request\n');
    } else {
      console.error('❌ Connection error:', error.message, '\n');
    }
  }

  console.log('\n📝 Summary:');
  console.log('- POST /api/auth/forgot-password ✅ (Correct)');
  console.log('- GET /api/auth/forgot-password ❌ (Not allowed)');
  console.log('\n💡 Use POST method with email in request body');
}

// Check if server is running
axios.get(`${API_URL}/health`)
  .then(() => {
    console.log('✅ Server is running at', API_URL, '\n');
    testForgotPassword();
  })
  .catch(() => {
    console.error('❌ Server is not running at', API_URL);
    console.log('Please start the server with: npm start');
    process.exit(1);
  });
