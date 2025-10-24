require('dotenv').config();
const EmailService = require('./services/emailService');

const emailService = new EmailService();

// Test employer data - Using REAL user data structure from database
const testEmployer = {
  name: 'Jane Doe',
  email: 'globalskills4@gmail.com', // Actual employer email
  companyInfo: {
    name: 'Tech Solutions Rwanda Ltd',
    industry: 'Information Technology',
    size: '51-200',
    website: 'https://techsolutions.rw',
    description: 'Leading IT solutions provider in Rwanda'
  },
  location: {
    city: 'Kigali',
    country: 'Rwanda',
    address: 'KG 5 Ave, Kigali'
  },
  phone: '+250788123456',
  createdAt: new Date('2024-10-15T10:30:00'),
  role: 'employer'
};

const testAdminNotes = 'Your application has been reviewed and meets all our requirements. Welcome to Global Skills Bridge!';

async function testApprovalEmail() {
  console.log('Testing Employer Approval Email...');
  console.log('Sending approval email to:', testEmployer.email);
  
  try {
    // Test APPROVED email
    const result = await emailService.sendEmployerApprovalEmail(testEmployer, true, testAdminNotes);
    
    if (result.success) {
      console.log('✅ SUCCESS! Approval email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\nCheck your Gmail inbox at:', testEmployer.email);
      console.log('The email contains a link to your dashboard.');
    } else {
      console.log('❌ FAILED! Email was not sent.');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

async function testRejectionEmail() {
  console.log('\n\n--- Testing Employer Rejection Email ---');
  console.log('Sending rejection email to:', testEmployer.email);
  
  try {
    const rejectionNotes = 'We need additional documentation to verify your company registration. Please update your profile with your company registration certificate.';
    
    // Test REJECTED email
    const result = await emailService.sendEmployerApprovalEmail(testEmployer, false, rejectionNotes);
    
    if (result.success) {
      console.log('✅ SUCCESS! Rejection email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\nCheck your Gmail inbox at:', testEmployer.email);
    } else {
      console.log('❌ FAILED! Email was not sent.');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('==============================================');
  console.log('  EMPLOYER APPROVAL EMAIL TEST');
  console.log('==============================================\n');
  
  console.log('Email Configuration:');
  console.log('- SMTP Host:', process.env.SMTP_HOST);
  console.log('- SMTP User:', process.env.SMTP_USER);
  console.log('- Frontend URL:', process.env.FRONTEND_URL);
  console.log('- Test Email:', testEmployer.email);
  console.log('\n');
  
  // Test approval email
  await testApprovalEmail();
  
  // Wait 3 seconds before sending rejection email
  console.log('\nWaiting 3 seconds before sending rejection email...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test rejection email
  await testRejectionEmail();
  
  console.log('\n==============================================');
  console.log('  TEST COMPLETED');
  console.log('==============================================');
  console.log('\nPlease check your Gmail inbox at:', testEmployer.email);
  console.log('You should receive 2 emails:');
  console.log('1. ✅ Account Approved email (with green badge)');
  console.log('2. ❌ Account Rejected email (with red badge)');
  console.log('\nBoth emails contain links that redirect to the Global Skills Bridge app.');
}

runTests();
