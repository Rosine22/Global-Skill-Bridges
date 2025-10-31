const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing test users
    await User.deleteMany({ email: { $in: ['test@example.com', 'employer@example.com', 'jobseeker@example.com'] } });
    console.log('🗑️  Deleted existing test users');
    
    // Create test users with different roles
    const testUsers = [
      {
        name: 'Test Job Seeker',
        email: 'jobseeker@example.com',
        password: 'password123',
        role: 'job-seeker',
        isEmailVerified: true,
        isActive: true
      },
      {
        name: 'Test Employer',
        email: 'employer@example.com',
        password: 'password123',
        role: 'employer',
        isEmailVerified: true,
        isActive: true,
        companyInfo: {
          name: 'Test Company',
          industry: 'Technology'
        }
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'job-seeker',
        isEmailVerified: true,
        isActive: true
      }
    ];
    
    for (const userData of testUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
    
    console.log('\n📋 Test Credentials:');
    console.log('===================================');
    console.log('Email: jobseeker@example.com');
    console.log('Password: password123');
    console.log('Role: job-seeker');
    console.log('-----------------------------------');
    console.log('Email: employer@example.com');
    console.log('Password: password123');
    console.log('Role: employer');
    console.log('-----------------------------------');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('Role: job-seeker');
    console.log('===================================\n');
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

createTestUser();
