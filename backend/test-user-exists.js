const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check for any users
    const allUsers = await User.find({}).select('email role isActive isBlocked');
    console.log('\n=== All Users in Database ===');
    console.log('Total users:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}, Blocked: ${user.isBlocked}`);
    });
    
    // Check specific test user
    const testUser = await User.findOne({ email: 'test@example.com' }).select('+password');
    if (testUser) {
      console.log('\n=== Test User Found ===');
      console.log('Email:', testUser.email);
      console.log('Name:', testUser.name);
      console.log('Role:', testUser.role);
      console.log('Has Password:', !!testUser.password);
      console.log('Active:', testUser.isActive);
      console.log('Blocked:', testUser.isBlocked);
    } else {
      console.log('\nNo test user found with email: test@example.com');
    }
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
