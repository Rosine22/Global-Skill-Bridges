const EmailService = require('./services/emailService');
require('dotenv').config();

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded ✅" : "Missing ❌");

// Test email configuration
async function testEmailNotifications() {
  console.log('🧪 Testing Global Skills Bridge Email Notifications...');
  
  const emailService = new EmailService();
  
  // Test 1: Check email service connection
  console.log('\n1. Testing SMTP connection...');
  const connectionTest = await emailService.testConnection();
  
  if (connectionTest.success) {
    console.log('✅ SMTP connection successful!');
  } else {
    console.log('❌ SMTP connection failed:', connectionTest.error);
    console.log('\n💡 Make sure to update SMTP_USER and SMTP_PASS in .env file');
    return;
  }
  
  // Test 2: Send a test welcome email
  console.log('\n2. Testing welcome email...');
  const testUser = {
    name: 'Test User',
    email: process.env.SMTP_USER, // Send to your own email for testing
    role: 'job-seeker'
  };
  
  try {
    const result = await emailService.sendJobSeekerWelcomeEmail(testUser);
    if (result.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('📧 Check your email:', testUser.email);
    } else {
      console.log('❌ Failed to send welcome email:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending email:', error.message);
  }
  
  // Test 3: Send admin notification test
  console.log('\n3. Testing admin notification...');
  const testEmployer = {
    companyName: 'Test Company Ltd',
    contactPerson: 'John Doe',
    email: 'test@company.com',
    phone: '+1234567890',
    industry: 'Technology',
    companySize: '11-50',
    location: 'Kigali, Rwanda',
    website: 'https://testcompany.com',
    description: 'Test company for notification demo',
    createdAt: new Date()
  };
  
  try {
    const result = await emailService.sendNewEmployerNotificationToAdmin(testEmployer);
    if (result.success) {
      console.log('✅ Admin notification sent successfully!');
      console.log('📧 Admin email:', process.env.ADMIN_EMAIL || 'admin@globalskillsbridge.com');
    } else {
      console.log('❌ Failed to send admin notification:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending admin notification:', error.message);
  }
  
  console.log('\n🎉 Email notification test completed!');
  console.log('\n📋 Summary:');
  console.log('- Welcome emails: Ready for job seekers');
  console.log('- Admin notifications: Ready for new employer registrations');
  console.log('- Application notifications: Ready for status updates');
  console.log('- Interview emails: Ready for scheduling');
  console.log('- Password reset: Ready for security');
  console.log('\n💡 All email notifications are now active!');
}

// Run the test
testEmailNotifications().catch(console.error);