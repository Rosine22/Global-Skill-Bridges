require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Global-skills';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@globalskillsbridge.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create new admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@globalskillsbridge.com',
      password: 'Admin123!', // Change this password after first login!
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      isApproved: true,
      location: {
        city: 'Kigali',
        country: 'Rwanda'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: admin@globalskillsbridge.com');
    console.log('   Password: Admin123!');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
