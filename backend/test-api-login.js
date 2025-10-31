const axios = require('axios');

const testLoginAPI = async () => {
  try {
    console.log('\n=== Testing Login API ===\n');
    
    const credentials = {
      email: 'admin@gsb.com',
      password: 'Admin@GSB2024'
    };
    
    console.log('Testing credentials:', credentials);
    console.log('API URL: http://localhost:5000/api/auth/login\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data.user);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
  } catch (error) {
    console.log('❌ LOGIN FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    console.log('Full response:', error.response?.data);
  }
};

testLoginAPI();
