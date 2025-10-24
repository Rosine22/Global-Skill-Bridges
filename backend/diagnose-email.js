const EmailService = require('./services/emailService');
const User = require('./models/User');
const mongoose = require('mongoose');
require('dotenv').config();

async function diagnosePaswordResetIssue() {
  console.log('🔍 DIAGNOSING PASSWORD RESET EMAIL ISSUE');
  console.log('=====================================\n');

  // 1. Check Environment Variables
  console.log('1️⃣ CHECKING EMAIL CONFIGURATION:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('');

  // 2. Test SMTP Connection
  console.log('2️⃣ TESTING SMTP CONNECTION:');
  const emailService = new EmailService();
  
  try {
    const connectionTest = await emailService.testConnection();
    if (connectionTest.success) {
      console.log('✅ SMTP connection successful!');
    } else {
      console.log('❌ SMTP connection failed:', connectionTest.error);
      console.log('');
      console.log('🔧 POSSIBLE SOLUTIONS:');
      console.log('- Check if Gmail App Password is correct');
      console.log('- Verify 2FA is enabled on Gmail account');
      console.log('- Make sure SMTP_USER and SMTP_PASS are correct');
      console.log('- Check internet connection');
      return;
    }
  } catch (error) {
    console.log('❌ SMTP test failed with exception:', error.message);
    return;
  }
  
  console.log('');

  // 3. Test Sending Password Reset Email
  console.log('3️⃣ TESTING PASSWORD RESET EMAIL:');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Test sending password reset email
    const testUser = {
      email: process.env.SMTP_USER, // Send to your own email
      name: 'Test User'
    };
    
    const testToken = 'test-token-123';
    
    console.log(`📧 Sending test password reset email to: ${testUser.email}`);
    
    const emailResult = await emailService.sendPasswordResetEmail(
      testUser.email,
      testToken,
      testUser
    );

    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Message ID:', emailResult.messageId);
      console.log('');
      console.log('🔍 CHECK YOUR EMAIL INBOX:');
      console.log(`- Look for email from: ${process.env.FROM_EMAIL}`);
      console.log('- Subject: 🔐 Reset your Global Skills Bridge password');
      console.log('- Check spam folder if not in inbox');
    } else {
      console.log('❌ Failed to send password reset email:', emailResult.error);
    }

    await mongoose.connection.close();
    
  } catch (error) {
    console.log('❌ Error during email test:', error.message);
  }

  console.log('');
  console.log('4️⃣ TROUBLESHOOTING CHECKLIST:');
  console.log('□ Gmail App Password is correctly generated and pasted');
  console.log('□ 2-Factor Authentication is enabled on Gmail');
  console.log('□ SMTP_USER contains full Gmail address');
  console.log('□ SMTP_PASS contains App Password (not regular password)');
  console.log('□ Backend server is running when testing forgot password');
  console.log('□ Frontend is making request to correct backend URL');
  console.log('□ Check browser network tab for API request errors');
  console.log('□ Check backend console logs for error messages');
  console.log('');
  console.log('5️⃣ GMAIL APP PASSWORD SETUP:');
  console.log('1. Go to: https://myaccount.google.com/apppasswords');
  console.log('2. Select "Mail" and "Other" (name it "Global Skills Bridge")');
  console.log('3. Copy the 16-character password');
  console.log('4. Paste it in SMTP_PASS (no spaces)');
  console.log('');
  console.log('6️⃣ TEST FORGOT PASSWORD FLOW:');
  console.log('1. Start backend: npm start');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Go to login page → Click "Forgot Password"');
  console.log('4. Enter email and submit');
  console.log('5. Check backend console for email logs');
  console.log('6. Check email inbox/spam folder');
}

diagnosePaswordResetIssue().catch(console.error);