const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

// Define User schema inline
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isActive: Boolean,
  isBlocked: Boolean,
  isApproved: Boolean
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Test login
const testLogin = async () => {
  try {
    await connectDB();

    // Test credentials
    const testEmails = [
      { email: 'admin@gsb.com', password: 'Admin@GSB2024' },
      { email: 'admin@gsb.com', password: 'password123' }
    ];

    console.log('\n=== Testing Login Credentials ===\n');

    for (const test of testEmails) {
      console.log(`Testing: ${test.email} / ${test.password}`);
      
      const user = await User.findOne({ email: test.email }).select('+password');
      
      if (!user) {
        console.log('  ❌ User not found\n');
        continue;
      }

      console.log(`  ✓ User found: ${user.name} (${user.role})`);
      console.log(`  - Active: ${user.isActive}`);
      console.log(`  - Blocked: ${user.isBlocked}`);
      console.log(`  - Approved: ${user.isApproved}`);
      
      const isMatch = await user.matchPassword(test.password);
      
      if (isMatch) {
        console.log(`  ✅ PASSWORD MATCHES! Use: ${test.email} / ${test.password}\n`);
      } else {
        console.log(`  ❌ Password does not match\n`);
      }
    }

    // List all users
    console.log('=== All Users in Database ===\n');
    const allUsers = await User.find({}).select('email name role isActive isApproved');
    allUsers.forEach(u => {
      console.log(`- ${u.email} | ${u.name} | ${u.role} | Active: ${u.isActive} | Approved: ${u.isApproved}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testLogin();
