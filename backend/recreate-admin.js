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

// Recreate admin user
const recreateAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@gsb.com';
    const password = 'Admin@GSB2024';

    // Delete existing admin
    const deleted = await User.deleteOne({ email });
    if (deleted.deletedCount > 0) {
      console.log('\n✓ Existing admin user deleted');
    } else {
      console.log('\n! No existing admin user found');
    }

    // Create new admin user
    // Note: The User model has a pre-save hook that will hash the password
    const adminUser = new User({
      name: 'System Admin',
      email: email,
      password: password, // This will be hashed by the pre-save hook
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      isBlocked: false,
      isApproved: true,
      profileCompletion: 100,
      location: {
        city: 'Kigali',
        country: 'Rwanda'
      }
    });

    await adminUser.save();

    console.log('\n✓ New admin user created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: admin@gsb.com');
    console.log('   Password: Admin@GSB2024');

    // Verify it works
    const verifyUser = await User.findOne({ email }).select('+password');
    const isMatch = await verifyUser.matchPassword(password);

    console.log('\n🔐 Password Verification:');
    if (isMatch) {
      console.log('   ✅ Password verified successfully!');
      console.log('   ✅ You can now login with these credentials.');
    } else {
      console.log('   ❌ Password verification failed!');
      console.log('   ⚠️  There may be an issue with the password hashing.');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

recreateAdmin();
