const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestEmployer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test employer already exists
    const existingEmployer = await User.findOne({ email: 'test-employer-complete@example.com' });
    if (existingEmployer) {
      console.log('Test employer already exists, deleting...');
      await User.deleteOne({ email: 'test-employer-complete@example.com' });
    }

    // Create a complete test employer
    const testEmployer = new User({
      name: 'John Smith',
      email: 'test-employer-complete@example.com',
      password: 'password123',
      role: 'employer',
      phone: '+1234567890',
      location: {
        city: 'New York',
        country: 'United States',
        address: '123 Business Ave, Suite 100'
      },
      avatar: {
        url: 'https://via.placeholder.com/150/0066CC/FFFFFF?text=TC',
        public_id: 'test_company_logo_123'
      },
      companyInfo: {
        name: 'Test Company Inc.',
        industry: 'Technology',
        size: '51-200',
        website: 'https://testcompany.com',
        description: 'A leading technology company specializing in innovative software solutions for businesses worldwide.',
        registrationNumber: 'TC123456789',
        establishedYear: 2015,
        taxId: 'TAX123456789',
        remotePolicy: 'hybrid',
        logo: {
          url: 'https://via.placeholder.com/150/0066CC/FFFFFF?text=TC',
          public_id: 'test_company_logo_123'
        }
      },
      isApproved: false, // Pending approval
      isActive: true,
      isEmailVerified: true
    });

    await testEmployer.save();
    console.log('Test employer created successfully!');
    console.log('Employer details:');
    console.log({
      id: testEmployer._id,
      name: testEmployer.name,
      email: testEmployer.email,
      companyName: testEmployer.companyInfo.name,
      companyIndustry: testEmployer.companyInfo.industry,
      companySize: testEmployer.companyInfo.size,
      companyWebsite: testEmployer.companyInfo.website,
      companyLogo: testEmployer.companyInfo.logo,
      avatar: testEmployer.avatar,
      location: testEmployer.location,
      isApproved: testEmployer.isApproved,
      isActive: testEmployer.isActive
    });

  } catch (error) {
    console.error('Error creating test employer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestEmployer();