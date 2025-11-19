const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAdminEndpoints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Find all employers
    console.log('\n=== TEST 1: All Employers ===');
    const allEmployers = await User.find({ role: 'employer' })
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${allEmployers.length} total employers`);
    
    if (allEmployers.length > 0) {
      const sample = allEmployers[0];
      console.log('Sample employer data structure:');
      console.log({
        id: sample._id,
        name: sample.name,
        email: sample.email,
        role: sample.role,
        isApproved: sample.isApproved,
        isActive: sample.isActive,
        avatar: sample.avatar,
        companyInfo: sample.companyInfo,
        location: sample.location,
        phone: sample.phone,
        createdAt: sample.createdAt
      });
    }

    // Test 2: Find pending employers
    console.log('\n=== TEST 2: Pending Employers ===');
    const pendingEmployers = await User.find({
      role: 'employer',
      isApproved: false,
      isActive: true
    })
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${pendingEmployers.length} pending employers`);
    
    if (pendingEmployers.length > 0) {
      const sample = pendingEmployers[0];
      console.log('Sample pending employer:');
      console.log({
        id: sample._id,
        name: sample.name,
        email: sample.email,
        companyName: sample.companyInfo?.name,
        companyIndustry: sample.companyInfo?.industry,
        companySize: sample.companyInfo?.size,
        companyWebsite: sample.companyInfo?.website,
        companyDescription: sample.companyInfo?.description,
        companyLogo: sample.companyInfo?.logo,
        avatar: sample.avatar,
        location: sample.location,
        isApproved: sample.isApproved,
        isActive: sample.isActive
      });
    }

    // Test 3: Find approved employers
    console.log('\n=== TEST 3: Approved Employers ===');
    const approvedEmployers = await User.find({
      role: 'employer',
      isApproved: true
    })
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${approvedEmployers.length} approved employers`);

    // Test 4: Check data completeness
    console.log('\n=== TEST 4: Data Completeness Check ===');
    const employersWithMissingData = allEmployers.filter(emp => {
      return !emp.companyInfo || 
             !emp.companyInfo.name || 
             !emp.companyInfo.industry ||
             (!emp.avatar && !emp.companyInfo?.logo);
    });
    
    console.log(`Employers with missing company data: ${employersWithMissingData.length}`);
    
    if (employersWithMissingData.length > 0) {
      console.log('Employers missing data:');
      employersWithMissingData.forEach(emp => {
        console.log(`- ${emp.email}: Missing ${
          !emp.companyInfo ? 'companyInfo' :
          !emp.companyInfo.name ? 'company name' :
          !emp.companyInfo.industry ? 'industry' :
          (!emp.avatar && !emp.companyInfo?.logo) ? 'logo/avatar' : 'unknown'
        }`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testAdminEndpoints();