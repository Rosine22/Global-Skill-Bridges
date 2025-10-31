const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model schema (inline to avoid import issues)
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

// Create admin user
const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gsb.com' });
    
    if (existingAdmin) {
      console.log('\n✓ Admin user already exists!');
      console.log('  Email:', existingAdmin.email);
      console.log('  Name:', existingAdmin.name);
      console.log('  Role:', existingAdmin.role);
      console.log('\n✓ You can now login with:');
      console.log('  Email: admin@gsb.com');
      console.log('  Password: Admin@GSB2024\n');
      process.exit(0);
    }

    // Create new admin user with hashed password
    const hashedPassword = await bcrypt.hash('Admin@GSB2024', 10);
    
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@gsb.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      isBlocked: false,
      profileCompletion: 100,
      location: 'Kigali, Rwanda'
    });

    console.log('\n✓ Admin user created successfully!');
    console.log('\n Login Credentials:');
    console.log('   Email: admin@gsb.com');
    console.log('   Password: Admin@GSB2024');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createAdminUser();
