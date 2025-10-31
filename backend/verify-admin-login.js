const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model
const User = require('./models/User');

// Connect to MongoDB
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

// Verify admin login
const verifyAdminLogin = async () => {
  try {
    await connectDB();

    const email = 'admin@gsb.com';
    const password = 'Admin@GSB2024';

    // Find admin user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('\n✗ Admin user not found!');
      process.exit(1);
    }

    console.log('\n📋 Admin User Details:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Blocked:', user.isBlocked);
    console.log('   Approved:', user.isApproved);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('   Password Hash (first 30 chars):', user.password.substring(0, 30) + '...');

    // Test password match
    console.log('\n🔐 Testing Password Match:');
    console.log('   Testing password: Admin@GSB2024');
    
    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      console.log('   ✅ Password matches! Login should work.');
    } else {
      console.log('   ❌ Password does NOT match!');
      console.log('\n🔧 Let\'s test direct bcrypt comparison:');
      
      const directMatch = await bcrypt.compare(password, user.password);
      console.log('   Direct bcrypt.compare result:', directMatch);
      
      // Test with old password too
      console.log('\n🔧 Testing old password (password123):');
      const oldPasswordMatch = await bcrypt.compare('password123', user.password);
      console.log('   Old password match:', oldPasswordMatch);
      
      if (oldPasswordMatch) {
        console.log('\n⚠️  The database still has the old password!');
        console.log('   The update-admin-password script may not have worked properly.');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

verifyAdminLogin();
