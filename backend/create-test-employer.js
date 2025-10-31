const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/Global-skills';
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const createTestEmployer = async () => {
  try {
    await connectDB();

    // Delete existing test employer
    await User.deleteOne({ email: 'testemployer@gsb.com' });

    // Create test employer
    const testEmployer = new User({
      name: 'Test Employer Company',
      email: 'testemployer@gsb.com',
      password: 'Employer@123', // Will be hashed by pre-save hook
      role: 'employer',
      isEmailVerified: true,
      isActive: true,
      isBlocked: false,
      isApproved: true, // Pre-approved for easy testing
      profileCompletion: 50,
      location: {
        city: 'Kigali',
        country: 'Rwanda'
      },
      companyInfo: {
        name: 'Test Company Ltd',
        industry: 'Technology',
        size: '11-50',
        website: 'https://testcompany.com',
        description: 'Test company for development'
      }
    });

    await testEmployer.save();

    console.log('\n✅ Test Employer Created Successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: testemployer@gsb.com');
    console.log('   Password: Employer@123');
    console.log('   Role: employer');
    console.log('   Status: APPROVED (can post jobs)\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

createTestEmployer();
