const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testEmployerData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const employers = await User.find({ role: 'employer' })
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .limit(3);

    console.log('Found employers:', employers.length);
    
    employers.forEach((employer, index) => {
      console.log(`\n--- Employer ${index + 1} ---`);
      console.log('ID:', employer._id);
      console.log('Name:', employer.name);
      console.log('Email:', employer.email);
      console.log('Phone:', employer.phone);
      console.log('IsApproved:', employer.isApproved);
      console.log('CompanyInfo:', employer.companyInfo);
      console.log('Location:', employer.location);
      console.log('Avatar:', employer.avatar);
      console.log('CreatedAt:', employer.createdAt);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testEmployerData();