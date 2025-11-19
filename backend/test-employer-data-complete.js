const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function testEmployerDataFetch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch all employers with complete data
    const allEmployers = await User.find({ role: 'employer' })
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`\n=== COMPLETE EMPLOYER DATA TEST ===`);
    console.log(`Found ${allEmployers.length} total employers\n`);

    allEmployers.forEach((employer, index) => {
      console.log(`--- Employer ${index + 1} ---`);
      console.log(`ID: ${employer._id}`);
      console.log(`Name: ${employer.name}`);
      console.log(`Email: ${employer.email}`);
      console.log(`Phone: ${employer.phone || 'Not set'}`);
      console.log(`IsApproved: ${employer.isApproved}`);
      console.log(`IsActive: ${employer.isActive}`);
      console.log(`IsEmailVerified: ${employer.isEmailVerified || false}`);
      console.log(`ProfileCompletion: ${employer.profileCompletion || 0}%`);
      
      // Company Info
      console.log(`CompanyInfo:`);
      if (employer.companyInfo) {
        console.log(`  - Name: ${employer.companyInfo.name || 'Not set'}`);
        console.log(`  - Industry: ${employer.companyInfo.industry || 'Not set'}`);
        console.log(`  - Size: ${employer.companyInfo.size || 'Not set'}`);
        console.log(`  - Website: ${employer.companyInfo.website || 'Not set'}`);
        console.log(`  - Description: ${employer.companyInfo.description ? 'Set' : 'Not set'}`);
        console.log(`  - Registration Number: ${employer.companyInfo.registrationNumber || 'Not set'}`);
        console.log(`  - Established Year: ${employer.companyInfo.establishedYear || 'Not set'}`);
        console.log(`  - Tax ID: ${employer.companyInfo.taxId || 'Not set'}`);
        console.log(`  - Remote Policy: ${employer.companyInfo.remotePolicy || 'Not set'}`);
        console.log(`  - Logo: ${employer.companyInfo.logo?.url ? 'Set' : 'Not set'}`);
      } else {
        console.log(`  - No company info set`);
      }
      
      // Location
      console.log(`Location:`);
      if (employer.location) {
        console.log(`  - City: ${employer.location.city || 'Not set'}`);
        console.log(`  - Country: ${employer.location.country || 'Not set'}`);
        console.log(`  - Address: ${employer.location.address || 'Not set'}`);
      } else {
        console.log(`  - No location set`);
      }
      
      // Avatar
      console.log(`Avatar: ${employer.avatar?.url ? 'Set' : 'Not set'}`);
      
      // Dates
      console.log(`CreatedAt: ${employer.createdAt}`);
      console.log(`ApprovalDate: ${employer.approvalDate || 'Not approved yet'}`);
      
      // Admin Notes
      console.log(`AdminNotes: ${employer.adminNotes?.length || 0} notes`);
      
      // Approved By
      if (employer.approvedBy) {
        console.log(`ApprovedBy: ${employer.approvedBy.name || employer.approvedBy.email || 'Unknown'}`);
      }
      
      console.log(''); // Empty line for readability
    });

    // Summary statistics
    const pendingCount = allEmployers.filter(e => !e.isApproved).length;
    const approvedCount = allEmployers.filter(e => e.isApproved).length;
    const emailVerifiedCount = allEmployers.filter(e => e.isEmailVerified).length;
    const withCompanyInfoCount = allEmployers.filter(e => e.companyInfo?.name).length;
    const withLocationCount = allEmployers.filter(e => e.location?.city || e.location?.country).length;
    const withPhoneCount = allEmployers.filter(e => e.phone).length;

    console.log(`=== SUMMARY STATISTICS ===`);
    console.log(`Total Employers: ${allEmployers.length}`);
    console.log(`Pending Approval: ${pendingCount}`);
    console.log(`Approved: ${approvedCount}`);
    console.log(`Email Verified: ${emailVerifiedCount}`);
    console.log(`With Company Info: ${withCompanyInfoCount}`);
    console.log(`With Location: ${withLocationCount}`);
    console.log(`With Phone: ${withPhoneCount}`);

  } catch (error) {
    console.error('Error testing employer data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testEmployerDataFetch();