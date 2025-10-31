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

// Update admin password
const updateAdminPassword = async () => {
  try {
    await connectDB();

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@gsb.com' });
    
    if (!adminUser) {
      console.log('\n✗ Admin user not found!');
      console.log('  Run "node create-admin.js" first to create the admin user.\n');
      process.exit(1);
    }

    // Hash the new password
    const newPassword = 'Admin@GSB2024';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('\n✓ Admin password updated successfully!');
    console.log('\n📝 New Login Credentials:');
    console.log('   Email: admin@gsb.com');
    console.log('   Password: Admin@GSB2024');
    console.log('\n✓ You can now login with the new password!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error updating admin password:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

updateAdminPassword();
