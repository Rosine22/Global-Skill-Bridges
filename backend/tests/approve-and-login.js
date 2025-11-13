/*
  Quick integration verification script:
  - Registers a test employer (email: testflow@gsb.com) via the public register API
  - Logs in as admin to get an admin token
  - Approves the test employer via admin API
  - Attempts to login as the employer and verifies the response contains isApproved: true

  Requirements: backend server must be running (default http://localhost:5000).

  Run:
    node backend/tests/approve-and-login.js

*/

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

// Default to the deployed frontend/backend base you provided; allow overriding via TEST_API_BASE or API_BASE_URL
const API_BASE = process.env.TEST_API_BASE || process.env.API_BASE_URL || 'https://global-skill-bridges-git-2fd38f-uwinezarosine16-2552s-projects.vercel.app';

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/Global-skills';
  await mongoose.connect(mongoURI);
}

async function main() {
  console.log('Integration test: approve employer -> employer login');

  // ensure DB connection for cleanup
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  // Test accounts
  const adminCreds = { email: process.env.TEST_ADMIN_EMAIL || 'admin@gsb.com', password: process.env.TEST_ADMIN_PASSWORD || 'Admin@GSB2024' };
  const employerData = {
    name: 'Integration Test Employer',
    email: process.env.TEST_EMPLOYER_EMAIL || 'testflow@gsb.com',
    password: process.env.TEST_EMPLOYER_PASSWORD || 'Employer@123',
    role: 'employer',
    companyInfo: {
      name: 'Integration Test Co',
      industry: 'Testing',
    }
  };

  // Cleanup any existing test employer in DB
  try {
    await User.deleteMany({ email: employerData.email });
    console.log('Cleaned existing test employer records');
  } catch (err) {
    console.warn('Cleanup warning:', err.message);
  }

  // 1) Register employer via API
  let createdUser = null;
  try {
    console.log('Registering test employer via API...');
    const res = await axios.post(`${API_BASE}/api/auth/register`, employerData, { headers: { 'Content-Type': 'application/json' } });
    if (res.data && res.data.success) {
      createdUser = res.data.user;
      console.log('Registered employer:', createdUser.email, 'id:', createdUser.id || createdUser._id);
    } else {
      console.error('Registration response indicates failure:', res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('Registration failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }

  const employerId = createdUser.id || createdUser._id;

  // 2) Login as admin to get token
  let adminToken;
  try {
    console.log('Logging in as admin...');
    const res = await axios.post(`${API_BASE}/api/auth/login`, adminCreds, { headers: { 'Content-Type': 'application/json' } });
    if (res.data && res.data.success && res.data.token) {
      adminToken = res.data.token;
      console.log('Got admin token');
    } else {
      console.error('Admin login failed:', res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('Admin login error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }

  // 3) Approve the employer via admin API
  try {
    console.log('Approving employer via admin API...');
    const res = await axios.put(`${API_BASE}/api/admin/employers/${employerId}/approve`, { approve: true }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` } });
    if (res.data && res.data.success) {
      console.log('Employer approved.');
    } else {
      console.error('Approve API returned failure:', res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('Approve request failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }

  // 4) Attempt login as employer
  try {
    console.log('Attempting employer login...');
    const res = await axios.post(`${API_BASE}/api/auth/login`, { email: employerData.email, password: employerData.password }, { headers: { 'Content-Type': 'application/json' } });
    if (res.data && res.data.success) {
      const user = res.data.user;
      console.log('Employer login successful. isApproved:', user.isApproved, 'isActive:', user.isActive);
      if (user.isApproved) {
        console.log('\n✅ Integration test passed: approved employer can login.');
        process.exit(0);
      } else {
        console.error('\n✗ Integration test failed: employer login succeeded but isApproved is false.');
        process.exit(1);
      }
    } else {
      console.error('Employer login failed:', res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('Employer login request failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

main();
