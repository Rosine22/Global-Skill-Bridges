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

// Test RTB login functionality
const testRTBLogin = async () => {
  try {
    await connectDB();

    console.log('\n🔍 Testing RTB Login Functionality...\n');

    // Check if RTB admin exists
    const rtbAdmin = await User.findOne({ email: 'rtb@gsb.com' });
    
    if (!rtbAdmin) {
      console.log('❌ RTB Admin user not found!');
      console.log('   Run: node create-rtb-admin.js to create RTB admin user\n');
      process.exit(1);
    }

    console.log('✅ RTB Admin user found:');
    console.log('   Email:', rtbAdmin.email);
    console.log('   Name:', rtbAdmin.name);
    console.log('   Role:', rtbAdmin.role);
    console.log('   Active:', rtbAdmin.isActive);
    console.log('   Approved:', rtbAdmin.isApproved);
    console.log('   Email Verified:', rtbAdmin.isEmailVerified);

    // Test password verification
    const testPassword = 'RTB@GSB2024';
    const isPasswordValid = await bcrypt.compare(testPassword, rtbAdmin.password);
    
    console.log('\n🔐 Password Test:');
    console.log('   Test Password:', testPassword);
    console.log('   Password Valid:', isPasswordValid ? '✅' : '❌');

    // Check RTB info
    if (rtbAdmin.rtbInfo) {
      console.log('\n📋 RTB Info:');
      console.log('   Department:', rtbAdmin.rtbInfo.department);
      console.log('   Position:', rtbAdmin.rtbInfo.position);
      console.log('   Permissions:', rtbAdmin.rtbInfo.permissions);
    }

    // Check all RTB admins
    const allRTBAdmins = await User.find({ role: 'rtb-admin' });
    console.log('\n👥 All RTB Admins in system:', allRTBAdmins.length);
    allRTBAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - Active: ${admin.isActive}`);
    });

    console.log('\n✅ RTB Login Test Complete!');
    console.log('\n🎯 Login Instructions:');
    console.log('   1. Go to /login');
    console.log('   2. Use email: rtb@gsb.com');
    console.log('   3. Use password: RTB@GSB2024');
    console.log('   4. You should be redirected to RTB Dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error testing RTB login:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

testRTBLogin();